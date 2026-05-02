/**
 * Stack Overflow–style LLD (in-memory).
 * Interview notes: service owns maps; Mutex serializes writes for consistency;
 * reputation rules are simple constants you can explain in one sentence.
 */
var VoteType;
(function (VoteType) {
    VoteType[VoteType["UPVOTE"] = 1] = "UPVOTE";
    VoteType[VoteType["DOWNVOTE"] = -1] = "DOWNVOTE";
})(VoteType || (VoteType = {}));
/** Reputation: activity when you post; “quality” when others vote your content */
const REP = {
    ASK_QUESTION: 5,
    POST_ANSWER: 10,
    POST_COMMENT: 2,
    RECEIVE_UPVOTE: 10,
    RECEIVE_DOWNVOTE: -2,
};
class User {
    id;
    name;
    reputation = 0;
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    addReputation(delta) {
        this.reputation += delta;
    }
}
/** Shared by Question and Answer: content, author, comments, votes */
class Post {
    id;
    content;
    createdBy;
    createdAt;
    comments = [];
    /** one vote per user; value is current vote */
    voteByUser = new Map();
    /** sum of UP (+1) and DOWN (-1) for quick display */
    score = 0;
    constructor(id, content, createdBy, createdAt = new Date()) {
        this.id = id;
        this.content = content;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }
    getComments() {
        return this.comments;
    }
    addComment(comment) {
        this.comments.push(comment);
    }
    /**
     * Toggle: same vote again removes it. Different vote replaces.
     * `onAuthorReputation` applies to post author (not voter).
     */
    vote(voterId, type, onAuthorReputation) {
        if (voterId === this.createdBy.id) {
            throw new Error("Cannot vote on your own post");
        }
        const prev = this.voteByUser.get(voterId);
        if (prev === type) {
            this.voteByUser.delete(voterId);
            this.score -= type;
            onAuthorReputation(-repForVoteImpact(prev));
            return;
        }
        if (prev !== undefined) {
            this.score -= prev;
            onAuthorReputation(-repForVoteImpact(prev));
        }
        this.voteByUser.set(voterId, type);
        this.score += type;
        onAuthorReputation(repForVoteImpact(type));
    }
}
function repForVoteImpact(v) {
    return v === VoteType.UPVOTE ? REP.RECEIVE_UPVOTE : REP.RECEIVE_DOWNVOTE;
}
class Comment {
    id;
    content;
    createdBy;
    createdAt;
    constructor(id, content, createdBy, createdAt = new Date()) {
        this.id = id;
        this.content = content;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
    }
}
class Question extends Post {
    createdAt;
    tags;
    answers = [];
    constructor(id, content, createdBy, tags, createdAt = new Date()) {
        super(id, content, createdBy, createdAt);
        this.createdAt = createdAt;
        this.tags = new Set(tags.map((t) => t.toLowerCase().trim()).filter(Boolean));
    }
    getAnswers() {
        return this.answers;
    }
    addAnswer(answer) {
        this.answers.push(answer);
    }
    /** Keyword match on title+body (question text only here) */
    matchesKeyword(keyword) {
        const k = keyword.toLowerCase().trim();
        if (!k)
            return true;
        return this.content.toLowerCase().includes(k);
    }
    hasTag(tag) {
        return this.tags.has(tag.toLowerCase().trim());
    }
    /** User “involved” if they asked or answered this question */
    involvesUser(userId) {
        if (this.createdBy.id === userId)
            return true;
        return this.answers.some((a) => a.createdBy.id === userId);
    }
}
class Answer extends Post {
    questionId;
    createdAt;
    constructor(id, content, createdBy, questionId, createdAt = new Date()) {
        super(id, content, createdBy, createdAt);
        this.questionId = questionId;
        this.createdAt = createdAt;
    }
}
/** Simple async mutex: one critical section at a time (good enough for demo / interview) */
class Mutex {
    locked = false;
    queue = [];
    lock() {
        return new Promise((resolve) => {
            if (!this.locked) {
                this.locked = true;
                resolve();
            }
            else {
                this.queue.push(resolve);
            }
        });
    }
    unlock() {
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            next?.();
        }
        else {
            this.locked = false;
        }
    }
}
export class StackOverflowService {
    questions = new Map();
    users = new Map();
    mutex = new Mutex();
    async withLock(fn) {
        await this.mutex.lock();
        try {
            return fn();
        }
        finally {
            this.mutex.unlock();
        }
    }
    async createUser(id, name) {
        return this.withLock(() => {
            if (this.users.has(id))
                throw new Error("User id already exists");
            const user = new User(id, name);
            this.users.set(id, user);
            return user;
        });
    }
    async createQuestion(id, content, createdBy, tags) {
        return this.withLock(() => {
            if (this.questions.has(id))
                throw new Error("Question id already exists");
            this.getUserSync(createdBy.id);
            const q = new Question(id, content, createdBy, tags);
            this.questions.set(id, q);
            createdBy.addReputation(REP.ASK_QUESTION);
            return q;
        });
    }
    async createAnswer(questionId, answerId, content, user) {
        return this.withLock(() => {
            const question = this.getQuestionSync(questionId);
            const author = this.getUserSync(user.id);
            const answer = new Answer(answerId, content, author, questionId);
            question.addAnswer(answer);
            author.addReputation(REP.POST_ANSWER);
            return answer;
        });
    }
    async addComment(post, userId, content) {
        return this.withLock(() => {
            const user = this.getUserSync(userId);
            const comment = new Comment(`c-${Date.now()}`, content, user);
            post.addComment(comment);
            user.addReputation(REP.POST_COMMENT);
            return comment;
        });
    }
    async voteOnPost(post, voterId, type) {
        return this.withLock(() => {
            const voter = this.getUserSync(voterId);
            post.vote(voter.id, type, (delta) => post.createdBy.addReputation(delta));
        });
    }
    /** OR search feel: pass only the filters you need */
    async searchQuestions(filters) {
        return this.withLock(() => {
            const out = [];
            for (const q of this.questions.values()) {
                if (filters.keyword !== undefined && !q.matchesKeyword(filters.keyword))
                    continue;
                if (filters.tag !== undefined && !q.hasTag(filters.tag))
                    continue;
                if (filters.userId !== undefined && !q.involvesUser(filters.userId))
                    continue;
                out.push(q);
            }
            return out;
        });
    }
    async getReputation(userId) {
        return this.withLock(() => this.getUserSync(userId).reputation);
    }
    getQuestion(id) {
        return this.withLock(() => this.getQuestionSync(id));
    }
    getUser(id) {
        return this.withLock(() => this.getUserSync(id));
    }
    getQuestionSync(id) {
        const q = this.questions.get(id);
        if (!q)
            throw new Error("Question not found");
        return q;
    }
    getUserSync(id) {
        const u = this.users.get(id);
        if (!u)
            throw new Error("User not found");
        return u;
    }
}
// --- Demo: run with `npx tsx stackOverflow/stackOverflow.ts` (or compile & run) ---
async function demo() {
    const app = new StackOverflowService();
    const alice = await app.createUser("u1", "Alice");
    const bob = await app.createUser("u2", "Bob");
    const q = await app.createQuestion("q1", "How do I plan a sprint?", alice, ["planning", "agile"]);
    const a = await app.createAnswer("q1", "a1", "Break work into small tasks.", bob);
    await app.addComment(q, "u2", "Great question!");
    await app.addComment(a, "u1", "Thanks!");
    await app.voteOnPost(q, "u2", VoteType.UPVOTE);
    await app.voteOnPost(a, "u1", VoteType.UPVOTE);
    const byTag = await app.searchQuestions({ tag: "agile" });
    const byKeyword = await app.searchQuestions({ keyword: "sprint" });
    const byUser = await app.searchQuestions({ userId: "u2" });
    console.log("--- Demo ---");
    console.log("Question score:", q.score, "| Answer score:", a.score);
    console.log("Alice reputation:", await app.getReputation("u1"));
    console.log("Bob reputation:", await app.getReputation("u2"));
    console.log("Search by tag 'agile':", byTag.map((x) => x.id));
    console.log("Search keyword 'sprint':", byKeyword.map((x) => x.id));
    console.log("Search user Bob (asked/answered):", byUser.map((x) => x.id));
}
demo().catch((e) => console.error(e));
