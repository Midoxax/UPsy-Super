// The first eleven posts, each written as its own page under pages/blog/
// (English, with translations through the t() keys below). Newer posts are
// data in ./articles.ts. Kept here, not in the index page, so the blog
// index, the RSS/JSON feed, the newsletter and social posting share one list.

export interface LegacyPost {
  slug: string;
  titleKey: string;
  descKey: string;
  fallbackTitle: string;
  fallbackDesc: string;
  category: string;
  categoryKey: string;
  readTime: string;
  color: string;
}

export const LEGACY_POSTS: LegacyPost[] = [
  {
    slug: "find-right-psychologist",
    titleKey: "blog.findPsych.title",
    descKey: "blog.findPsych.intro",
    fallbackTitle: "How to Find the Right Psychologist for You",
    fallbackDesc:
      "Finding the right psychologist can feel overwhelming. This guide breaks down the process into simple, actionable steps so you can make a confident choice.",
    category: "Guide",
    categoryKey: "blog.guide",
    readTime: "5 min",
    color: "bg-primary/10 text-primary",
  },
  {
    slug: "do-i-need-therapy",
    titleKey: "blog.therapy.title",
    descKey: "blog.therapy.intro",
    fallbackTitle: "Do I Need Therapy?",
    fallbackDesc:
      "If you're asking this question, you're already taking a brave step. Here's how to recognize when professional support could help.",
    category: "Mental Health",
    categoryKey: "blog.mentalHealth",
    readTime: "6 min",
    color: "bg-secondary/10 text-secondary",
  },
  {
    slug: "understanding-anxiety",
    titleKey: "blog.anxiety.title",
    descKey: "blog.anxiety.intro",
    fallbackTitle: "Understanding Anxiety: What It Is and How to Manage It",
    fallbackDesc:
      "Anxiety is one of the most common mental health experiences. Learn what it really means and practical steps to manage it.",
    category: "Mental Health",
    categoryKey: "blog.mentalHealth",
    readTime: "5 min",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    slug: "benefits-online-therapy",
    titleKey: "blog.online.title",
    descKey: "blog.online.intro",
    fallbackTitle: "The Benefits of Online Therapy",
    fallbackDesc:
      "Online therapy has transformed mental health care. Discover why more people are choosing virtual sessions.",
    category: "Guide",
    categoryKey: "blog.guide",
    readTime: "4 min",
    color: "bg-primary/10 text-primary",
  },
  {
    slug: "mental-health-at-work",
    titleKey: "blog.work.title",
    descKey: "blog.work.intro",
    fallbackTitle: "Mental Health at Work: Why It Matters",
    fallbackDesc:
      "Work is one of the biggest factors affecting our mental health. Learn how to recognize burnout and create healthier boundaries.",
    category: "Workplace",
    categoryKey: "blog.workplace",
    readTime: "6 min",
    color: "bg-secondary/10 text-secondary",
  },
  {
    slug: "understanding-depression",
    titleKey: "blog.depression.title",
    descKey: "blog.depression.intro",
    fallbackTitle: "Understanding Depression: More Than Just Sadness",
    fallbackDesc:
      "Depression is one of the most common mental health conditions worldwide. Understanding what it really is — and what it isn't — is the first step toward recovery.",
    category: "Mental Health",
    categoryKey: "blog.mentalHealth",
    readTime: "5 min",
    color: "bg-secondary/10 text-secondary",
  },
  {
    slug: "how-to-support-a-loved-one",
    titleKey: "blog.support.title",
    descKey: "blog.support.intro",
    fallbackTitle: "How to Support a Loved One with Mental Health Challenges",
    fallbackDesc:
      "When someone you care about is struggling, knowing what to say — and what not to say — can make all the difference.",
    category: "Guide",
    categoryKey: "blog.guide",
    readTime: "5 min",
    color: "bg-primary/10 text-primary",
  },
  {
    slug: "mindfulness-for-beginners",
    titleKey: "blog.mindfulness.title",
    descKey: "blog.mindfulness.intro",
    fallbackTitle: "Mindfulness for Beginners: A Practical Guide",
    fallbackDesc:
      "Mindfulness isn't about emptying your mind. It's about paying attention to the present moment — without judgment.",
    category: "Wellness",
    categoryKey: "blog.wellness",
    readTime: "6 min",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    slug: "how-to-improve-focus",
    titleKey: "blog.focus.title",
    descKey: "blog.focus.intro",
    fallbackTitle: "How to Improve Focus and Concentration",
    fallbackDesc:
      "Focus is not a personality trait — it's a trainable skill. The four evidence-based levers, a 4-week protocol, and when to get help.",
    category: "Performance",
    categoryKey: "blog.performance",
    readTime: "7 min",
    color: "bg-primary/10 text-primary",
  },
  {
    slug: "how-to-clear-brain-fog",
    titleKey: "blog.brainFog.title",
    descKey: "blog.brainFog.intro",
    fallbackTitle:
      "How to Clear Brain Fog — Causes, Fixes and When to See a Doctor",
    fallbackDesc:
      "Brain fog is a signal, not a personality flaw. The five most common drivers, a 2-week clarity protocol, and the bloodwork to ask for.",
    category: "Performance",
    categoryKey: "blog.performance",
    readTime: "7 min",
    color: "bg-primary/10 text-primary",
  },
];
