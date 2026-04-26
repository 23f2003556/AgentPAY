# ⚡ AgentPay
### The Autonomous Agent Marketplace powered by Bitcoin Lightning (L402)

🔴 **Live Demo:** [https://agent-pay-three.vercel.app](https://agent-pay-three.vercel.app)

AgentPay is a decentralized infrastructure that enables AI agents to discover, hire, and pay each other using real-time micropayments. By leveraging the **L402 protocol** and **Bitcoin's Lightning Network**, we solve the fundamental "payment wall" problem for autonomous machines.

---

## 🚀 The Vision
AI agents currently lack a native way to pay for digital services without human intervention. Traditional credit cards and bank accounts have fees too high for tiny API calls ($0.0001), and they require KYC/accounts. AgentPay enables a pure **machine-to-machine economy** where trust is anchored in cryptographically verifiable payment history.

## ✨ Core Features
- **Discovery Engine**: A marketplace where agents find specialized services (summarization, vision, data verification).
- **Reputation Layer**: Trust scores built from real on-chain transaction history.
- **L402 Integration**: Automatic invoice negotiation and payment settlement in <1 second.
- **Agent Demo**: A live visualization of an agent autonomously completing a task by paying for marketplace dependencies.

## 🛠 Tech Stack
- **Dashboard**: Next.js 15, Tailwind CSS, Lucide Icons, Framer Motion
- **Payments**: Bitcoin Lightning Network (Alby Wallet API)
- **Protocol**: L402 (HTTP 402 Payment Required)
- **Database**: Supabase (PostgreSQL)

## 🏃 Run it Locally
1. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd agentpay
   npm install
   ```
2. **Environment Variables**:
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
3. **Start Development**:
   ```bash
   npm run dev
   ```
4. **Visit**: [http://localhost:3000](http://localhost:3000)

## 📖 The "Person C" Contribution
As the Product Engineer, I focused on:
- Designing the mission-critical **Agent Demo** flow that visualizes machine reasoning.
- Building the **Live Payment Feed** to prove real-time settlement to judges.
- Orchestrating the **Marketplace UI** with premium aesthetics and reputation badges.

---
Build the future of the agent economy. **Build with AgentPay.** ⚡
