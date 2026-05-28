"""
CreatorIQ AI - Demo Data Service
Generates realistic AI analysis instantly. No Gemini/OpenAI key needed.
All responses look 100% real for recruiter demos.
"""
import random
import json
import re
from typing import Optional


# ─── Platform URL Parser ──────────────────────────────────────────────────────

def detect_platform(url: str) -> str:
    url = url.lower()
    if "youtube.com" in url or "youtu.be" in url:
        return "youtube"
    elif "tiktok.com" in url:
        return "tiktok"
    elif "instagram.com" in url:
        return "instagram"
    elif "twitter.com" in url or "x.com" in url:
        return "twitter"
    return "youtube"


def extract_video_id(url: str, platform: str) -> str:
    try:
        if platform == "youtube":
            match = re.search(r"(?:v=|youtu\.be/)([a-zA-Z0-9_-]{11})", url)
            return match.group(1) if match else url[-11:]
        elif platform == "tiktok":
            match = re.search(r"/video/(\d+)", url)
            return match.group(1) if match else str(random.randint(10**17, 10**18))
        elif platform == "instagram":
            match = re.search(r"/(?:p|reel)/([a-zA-Z0-9_-]+)", url)
            return match.group(1) if match else "demo_reel"
    except Exception:
        pass
    return "demo_" + str(random.randint(1000, 9999))


# ─── Realistic Demo Titles ────────────────────────────────────────────────────

YOUTUBE_TITLES = [
    "How I Gained 100K Subscribers in 30 Days (Full Strategy)",
    "The Secret Algorithm Hack No One Talks About",
    "I Tried Every Viral Content Strategy For 30 Days",
    "Why 99% of Creators Fail (And How To Be In The 1%)",
    "From 0 to 1M Views: My Exact Blueprint",
    "The Hook Formula That Got Me 10M Views",
    "Stop Making These 5 Content Mistakes",
    "How I Made $50K From One Video",
]

TIKTOK_TITLES = [
    "POV: I cracked the TikTok algorithm 🔥",
    "This content strategy got me 2M views overnight",
    "Things they don't tell you about going viral",
    "Watch time hack that changes everything ⚡",
    "I posted every day for 90 days — here's what happened",
]

INSTAGRAM_TITLES = [
    "Reel strategy that got me 500K reach",
    "How I 10x'd my engagement overnight",
    "The hook formula for viral Reels",
    "Growing from 1K to 100K with this strategy",
    "Reels algorithm explained (2024)",
]

CREATORS = {
    "youtube": [
        ("MrGrowth", "@mrgrowth", 2_400_000),
        ("CreatorPro", "@creatorpro", 890_000),
        ("ViralVault", "@viralvault", 1_200_000),
        ("ContentKing", "@contentking", 3_100_000),
    ],
    "tiktok": [
        ("tikmaster", "@tikmaster", 4_500_000),
        ("viralqueen", "@viralqueen", 2_200_000),
        ("hookgod", "@hookgod", 980_000),
    ],
    "instagram": [
        ("reelmaster", "@reelmaster", 1_800_000),
        ("instragrowth", "@instragrowth", 670_000),
        ("contentalchemy", "@contentalchemy", 2_100_000),
    ],
}

THUMBNAILS = {
    "youtube": [
        "https://picsum.photos/seed/yt1/480/270",
        "https://picsum.photos/seed/yt2/480/270",
        "https://picsum.photos/seed/yt3/480/270",
        "https://picsum.photos/seed/yt4/480/270",
        "https://picsum.photos/seed/yt5/480/270",
    ],
    "tiktok": [
        "https://picsum.photos/seed/tt1/270/480",
        "https://picsum.photos/seed/tt2/270/480",
        "https://picsum.photos/seed/tt3/270/480",
    ],
    "instagram": [
        "https://picsum.photos/seed/ig1/400/500",
        "https://picsum.photos/seed/ig2/400/500",
        "https://picsum.photos/seed/ig3/400/500",
    ],
}


# ─── Score Generator ──────────────────────────────────────────────────────────

def generate_scores(seed: Optional[str] = None) -> dict:
    """Generate realistic-looking scores that aren't all identical."""
    rng = random.Random(seed)
    base = rng.randint(72, 95)
    def s(offset=0):
        return min(99, max(55, base + rng.randint(-8, 8) + offset))
    return {
        "hook_score": float(s(3)),
        "retention_score": float(s(-2)),
        "emotion_score": float(s(1)),
        "viral_score": float(s(5)),
        "storytelling_score": float(s(-4)),
        "cta_score": float(s(-6)),
        "pacing_score": float(s(2)),
        "overall_score": float(s(0)),
    }


# ─── Full Video Metadata Generator ───────────────────────────────────────────

def generate_video_metadata(url: str) -> dict:
    platform = detect_platform(url)
    vid_id = extract_video_id(url, platform)
    rng = random.Random(vid_id)

    titles = YOUTUBE_TITLES if platform == "youtube" else (TIKTOK_TITLES if platform == "tiktok" else INSTAGRAM_TITLES)
    title = rng.choice(titles)
    creator_name, creator_handle, followers = rng.choice(CREATORS.get(platform, CREATORS["youtube"]))
    thumbnail = rng.choice(THUMBNAILS.get(platform, THUMBNAILS["youtube"]))

    views = rng.randint(250_000, 8_500_000)
    likes = int(views * rng.uniform(0.04, 0.12))
    comments = int(views * rng.uniform(0.003, 0.012))
    shares = int(views * rng.uniform(0.01, 0.05))
    saves = int(views * rng.uniform(0.02, 0.07))
    duration = rng.randint(45, 720)

    return {
        "platform": platform,
        "video_id": vid_id,
        "original_url": url,
        "title": title,
        "description": f"🔥 {title}\n\nWatch until the end for the full strategy. Subscribe for more creator growth content!\n\n#contentcreator #viral #growth",
        "thumbnail_url": thumbnail,
        "duration": duration,
        "creator_name": creator_name,
        "creator_handle": creator_handle,
        "creator_followers": followers,
        "views": views,
        "likes": likes,
        "comments": comments,
        "shares": shares,
        "saves": saves,
        "transcript": generate_transcript(title, duration),
        "tags": json.dumps(["viral", "content", "growth", "creator", "strategy"]),
        "hashtags": json.dumps(["#viral", "#contentcreator", "#growth", "#youtube", "#strategy"]),
        "top_comments": json.dumps([
            {"author": "CreatorFan99", "text": "This literally changed how I make content 🔥", "likes": rng.randint(200, 5000)},
            {"author": "GrowthHacker", "text": "The hook formula at 2:15 is GOLD", "likes": rng.randint(100, 2000)},
            {"author": "NewCreator22", "text": "Tried this and got 10x my usual views!", "likes": rng.randint(50, 800)},
            {"author": "VideoGenius", "text": "Best content strategy video I've ever seen", "likes": rng.randint(30, 500)},
        ]),
    }


def generate_transcript(title: str, duration: int) -> str:
    return f"""[0:00] Hey, what's up everyone. Welcome back. Today I'm going to show you {title.lower()}.

[0:08] But first — here's the thing nobody talks about. Most creators are making the same 3 mistakes over and over again.

[0:18] Mistake number one: They're obsessed with production quality instead of hook quality. Your first 3 seconds determine everything.

[0:31] Here's what the data actually shows. Videos with pattern-interrupt hooks in the first 2 seconds get 40% more watch time on average.

[0:45] So here's my exact framework. I call it the HOOK-BUILD-PAYOFF method. Step one is your hook — make a bold, specific claim.

[1:02] Step two is the build. You tease the value without giving it away yet. Create that curiosity gap that keeps them watching.

[1:18] Step three is the payoff. Deliver on the promise, but add a twist they didn't expect. That's what triggers the share.

[1:35] Let me show you a real example. This is a video I posted 6 months ago with zero promotion. It hit {duration * 1200:,} views organically.

[1:52] The hook was: "I'm about to show you something that took me 3 years to figure out." Seven words. That's it. 

[2:10] The retention graph was nearly flat. 68% watch-through on a {duration}-second video. That's insane for this niche.

[2:28] Now here's the emotional trigger that made it shareable. I used the "relatability gap" — I talked about a struggle my audience has every single day.

[2:45] The CTA at the end wasn't "subscribe." It was "share this with one creator friend who needs to hear this." That drove 3x more shares.

[3:00] Let me break down the exact script structure I used...

[{duration//2}:00] And that's the complete framework. If you implement even ONE of these strategies this week, I guarantee you'll see a difference.

[{duration - 15}:00] If this helped you, hit that like button — it genuinely helps the algorithm and helps other creators find this video.

[{duration - 5}:00] I'll see you in the next one."""


# ─── Full Analysis Generator ──────────────────────────────────────────────────

def generate_analysis(video_metadata: dict) -> dict:
    seed = video_metadata.get("video_id", "demo")
    scores = generate_scores(seed)
    rng = random.Random(seed)

    title = video_metadata.get("title", "this video")
    platform = video_metadata.get("platform", "youtube")
    views = video_metadata.get("views", 500000)
    hook_score = scores["hook_score"]
    viral_score = scores["viral_score"]

    hook_adjective = "exceptional" if hook_score >= 88 else "strong" if hook_score >= 78 else "moderate"
    viral_adjective = "extremely high" if viral_score >= 88 else "high" if viral_score >= 78 else "moderate"

    return {
        **scores,

        "hook_analysis": f"The hook demonstrates {hook_adjective} stopping power. The opening frames create an immediate pattern interrupt with a bold claim that speaks directly to the target audience's core desire. The first 3 seconds score in the top {100 - int(hook_score)}th percentile for attention capture on {platform.capitalize()}. The specificity of the promise ('exact blueprint', 'full strategy') reduces skepticism and increases click-through intent.",

        "retention_analysis": f"Retention curve analysis shows a strong opening dropoff (expected) followed by a sustained plateau from 15% to 75% of duration — a signature of well-structured content. The pacing avoids the common '2-minute cliff' where most viewers abandon. Strategic re-engagement hooks at the 30%, 50%, and 75% marks maintain watch time. Estimated average view duration: {int(video_metadata.get('duration', 180) * 0.62)}s of {video_metadata.get('duration', 180)}s.",

        "emotion_analysis": f"This content successfully activates 3 primary emotional levers: (1) ASPIRATION — viewers see a version of their desired future self. (2) FOMO — the framing of 'secrets' and 'what no one tells you' creates urgency. (3) VALIDATION — the content validates existing frustrations, building instant trust. The emotional arc follows the proven Tension → Relief → Inspiration pattern with a satisfaction score in the top 15% of similar content.",

        "viral_analysis": f"Viral coefficient estimated at {viral_score:.0f}/100. Key viral drivers identified: shareable insight density (8.3 insights/minute vs 3.1 industry average), strong identity-alignment for creator-focused audiences, and a CTA optimized for sharing rather than just subscribing. The content's specificity makes it 'forward-worthy' — viewers feel it will make them look knowledgeable when shared with peers.",

        "storytelling_analysis": f"Story structure follows the proven Hero's Journey compressed for short-form: Problem identification (0-15s) → Agitation (15-45s) → Solution reveal (45-90s) → Proof/demonstration (90-end) → Call-to-action. The personal narrative elements ('I tried this', 'here's what happened') increase credibility by 43% compared to purely instructional content. Storytelling score reflects excellent use of the 'before/after' contrast technique.",

        "cta_analysis": f"The call-to-action is positioned at the 92% mark — optimal for platform algorithm satisfaction. However, the CTA could be strengthened by (1) adding social proof to the ask ('Join 50K creators who...'), (2) using a 'value echo' before the ask to remind viewers of what they just received, and (3) offering a tangible next step (linked resource, follow-up video) rather than a passive subscribe request. Current CTA conversion rate estimated at {rng.randint(3, 7)}% vs potential {rng.randint(8, 14)}% with optimization.",

        "pacing_analysis": f"Edit rhythm analysis: average cut every {rng.randint(2, 5)} seconds — within optimal range for {platform.capitalize()}. B-roll coverage: ~{rng.randint(40, 70)}% of runtime, preventing 'talking head fatigue'. Text overlays appear on {rng.randint(60, 85)}% of key points, catering to sound-off viewers (estimated {rng.randint(30, 50)}% of audience). Music energy level: appropriately medium — motivational without distraction.",

        "key_strengths": json.dumps([
            f"Exceptional pattern-interrupt hook — top {100-int(hook_score)}% for {platform}",
            "Multi-layer emotional trigger strategy (aspiration + FOMO + validation)",
            "High insight density — 8.3 actionable points per minute",
            "Strong social proof integration throughout the narrative",
            "Optimal retention architecture with strategic re-engagement points",
        ]),

        "improvement_areas": json.dumps([
            f"CTA optimization could increase conversion by ~{rng.randint(40, 120)}%",
            "Add a 'pattern interrupt' thumbnail element to boost CTR by ~15-25%",
            "Consider adding timestamps for key sections to improve YouTube SEO",
            "The 'proof section' (1:35-2:00) could be tightened by ~20 seconds",
            "Include a mid-video engagement prompt to boost comment rate",
        ]),

        "action_plan": json.dumps([
            {"priority": "HIGH", "action": "A/B test 3 hook variations focusing on specificity and urgency", "timeline": "This week"},
            {"priority": "HIGH", "action": "Rewrite CTA with social proof element and value echo", "timeline": "Next upload"},
            {"priority": "MEDIUM", "action": "Create a follow-up video that answers top 3 comments from this video", "timeline": "2 weeks"},
            {"priority": "MEDIUM", "action": "Repurpose the insight-dense 1:00-2:30 section as a standalone short", "timeline": "3 days"},
            {"priority": "LOW", "action": "Add chapter markers and optimize description with long-tail keywords", "timeline": "Today (5 min)"},
        ]),

        "target_audience": json.dumps({
            "primary": "Content creators aged 18-34 seeking growth strategies",
            "secondary": "Social media marketers and brand builders",
            "psychographics": "Ambitious, growth-obsessed, early adopter, values efficiency and shortcuts",
            "pain_points": ["Plateau in growth", "Low engagement despite good content", "Algorithm confusion", "Inconsistent views"],
            "platform_behavior": f"{'Power users averaging 45+ min/day on platform' if platform == 'youtube' else 'Scroll-heavy users, 2-4 second decision window'}",
        }),

        "emotional_triggers": json.dumps([
            "FOMO — fear of missing growth opportunities others are exploiting",
            "Aspiration — desire to become a successful, recognized creator",
            "Validation — confirmation that their current struggles are shared and solvable",
            "Curiosity — pattern-interrupt questions that demand resolution",
            "Urgency — time-sensitive framing of opportunities ('right now', 'before it's too late')",
        ]),

        "curiosity_gaps": json.dumps([
            "'The ONE thing most creators never figure out...' — opens a knowledge gap in first 5 seconds",
            "Numbered framework revealed gradually creates sustained curiosity about remaining steps",
            "Case study teased before explanation creates 'proof demand' that keeps viewers watching",
            "Strategic use of 'but here's the thing...' transitions to reset curiosity loops",
        ]),

        "storytelling_structure": json.dumps({
            "framework": "Problem-Agitate-Solve (PAS) with Hero Journey overlay",
            "act_1": f"0-{int(video_metadata.get('duration', 180)*0.15)}s: Hook + Problem identification",
            "act_2": f"{int(video_metadata.get('duration', 180)*0.15)}-{int(video_metadata.get('duration', 180)*0.7)}s: Framework delivery with proof points",
            "act_3": f"{int(video_metadata.get('duration', 180)*0.7)}s-end: Synthesis, social proof, and CTA",
            "tension_points": ["Opening bold claim creates stakes", "Mistakes section creates tension", "Solution release creates relief"],
        }),

        "viral_elements": json.dumps([
            "Specific, non-obvious claim in title drives high CTR from search and browse",
            "Shareable insight format — viewers want to 'teach' what they learned to others",
            "Strong identity match — makes viewers feel smart for watching (social currency)",
            f"Comment bait embedded in content — generates {rng.randint(200, 800)} organic comments on average",
            "Cross-platform repurposability — key clips work as Shorts/Reels/TikTok",
        ]),

        "improved_script": f"""[OPTIMIZED HOOK — 0:00-0:08]
"I analyzed the top {rng.randint(100, 500)} viral videos in this niche, and I found that {rng.randint(87, 97)}% of them share ONE thing in common. Most creators will never figure this out — but in the next {video_metadata.get('duration', 180)//60} minutes, you will."

[STRONGER PROBLEM AGITATION — 0:08-0:25]
"If you've ever posted what you thought was your best content, and it got a fraction of the views you expected — this is exactly why. And it's not the algorithm's fault. It's a fixable pattern."

[VALUE-LOADED MIDDLE]
[Keep original framework content — it's strong. Add: "Screenshot this next part" before each key framework point to boost saves by ~35%]

[OPTIMIZED CTA — Final 15 seconds]
"If you got one useful thing from this, share it with ONE creator friend right now — that's 10 seconds and it could genuinely change their growth trajectory. And follow for Part 2 where I show you the exact thumbnail formula that doubled my CTR." """,

        "improved_hook": f'"I spent {rng.randint(3, 8)} months studying why {rng.randint(5, 15)}% of creators get {rng.randint(80, 95)}% of views — and I found a pattern that nobody is talking about."',

        "improved_cta": f'"Before you scroll — share this with one creator who\'s been struggling with views. It takes 3 seconds and might genuinely change their trajectory. And hit follow so you don\'t miss Part 2 where I show you the exact framework I used to get from {rng.randint(1,10)}K to {rng.randint(100,500)}K."',

        "executive_summary": f"""This {platform.capitalize()} video demonstrates {hook_adjective} content performance with a viral coefficient of {viral_score:.0f}/100 — placing it in the top {100-int(viral_score)}% of analyzed content in this category.

**Core Strength**: The content's hook-to-value delivery ratio is exceptional. The creator successfully compresses {rng.randint(5,12)} high-value insights into a tight structure that respects audience time while delivering genuine transformation.

**Primary Opportunity**: CTA optimization represents the single highest-ROI improvement available. With the current insight quality, a stronger CTA could conservatively increase subscriber conversion by {rng.randint(40,120)}% and share rate by {rng.randint(25,80)}%.

**Growth Prediction**: Content of this caliber, with consistent posting (2-3x/week), has historically generated audience growth of {rng.randint(15,40)}K-{rng.randint(50,150)}K subscribers over 90 days in comparable niches.

**Platform Fit Score**: {rng.randint(82, 96)}/100 — this content is well-optimized for the {platform.capitalize()} algorithm's current ranking signals (watch time, saves, shares).""",
    }


# ─── Dashboard Stats Generator ───────────────────────────────────────────────

def generate_dashboard_stats(video_count: int, user_id: str) -> dict:
    rng = random.Random(user_id + str(video_count))
    total_views = video_count * rng.randint(200_000, 1_200_000)
    avg_viral = rng.uniform(78, 92)
    return {
        "total_videos": video_count,
        "total_views": total_views,
        "avg_viral_score": round(avg_viral, 1),
        "avg_engagement_rate": round(rng.uniform(4.2, 11.8), 2),
        "credits_used": video_count * 3,
        "credits_remaining": 1000 - (video_count * 3),
        "top_platform": "YouTube",
        "best_performing_category": "Creator Growth",
        "weekly_growth": round(rng.uniform(8, 34), 1),
    }


# ─── Chat Response Generator ─────────────────────────────────────────────────

CHAT_RESPONSES = {
    "hook": """**Hook Analysis & Optimization** 🎯

Based on your analyzed videos, I can see a clear pattern in what's working for your hooks:

**What's Making Your Best Hooks Work:**
- Specificity beats vagueness every time ("I gained 100K in 30 days" vs "grow your channel")
- Your top performers all open with a data point or bold claim within 2 seconds
- The curiosity gap technique in your recent upload performed in the top 12% of similar content

**Recommended Hook Formula for Your Niche:**
```
[Specific Result] + [Timeframe] + [Contrarian Element]
"I got 2M views in 72 hours using a strategy that contradicts everything YouTube recommends."
```

**Immediate Action:** For your next video, write 5 hook variations before choosing one. A/B test them as Shorts first to validate before going long-form. Creators who A/B test hooks see 40-60% higher CTR on average.""",

    "viral": """**Viral Potential Analysis** 🚀

Looking at your video library, here's what separates your viral content from your average performers:

**Your Viral Content Fingerprint:**
1. **Identity-aligned topics** — your audience shares your videos because it makes them look knowledgeable
2. **High "forward-worthiness"** — specific, actionable insights that solve a pain point
3. **Emotional resonance score above 85** — your top videos all create aspiration + validation simultaneously

**The Gap:** Your CTAs are leaving virality on the table. Your content quality earns shares, but you're not *asking* for shares in a compelling way.

**Fix This Week:**
Replace "subscribe if this helped" with: "Share this with one creator friend — it might change their trajectory this month."

That one change has driven 2-4x share rates in comparable content tests.""",

    "script": """**Script Improvement Suggestions** ✍️

Here's a rewrite of your key sections using high-performance script patterns:

**HOOK (Replace your opening with):**
> "I'm about to show you something that took me 18 months to figure out — and once you see it, you can't unsee it."

**MID-VIDEO RE-ENGAGEMENT (Add at the 40% mark):**
> "Stick with me for 60 more seconds — because what I'm about to show you is the part most creators skip, and it's why they stay stuck."

**CTA REWRITE:**
> "Before you scroll — share this with one creator who needs this. Takes 3 seconds. Might change their year. I'll see you in the next one."

**Key Script Principles Working in Your Content:**
- Your personal story elements are strong — keep them
- The framework structure (numbered steps) is performing well
- Add 1-2 "screenshot this" prompts to boost saves by ~35%""",

    "default": """**CreatorIQ AI Analysis** 📊

Great question! Based on the content in your video library, here's what I'm seeing:

**Performance Patterns:**
Your content is performing well in hook strength (avg 87/100) and emotional resonance, but there's consistent room to improve in CTAs and pacing in the 60-80% mark of your videos.

**Top Insight for Your Next Video:**
The highest-ROI change you can make right now is your call-to-action. Your current CTAs average a 3.2% conversion rate. With a value-echo CTA (reminding viewers what they just learned before asking for the follow), you could realistically hit 7-9%.

**What Would You Like to Dive Deeper Into?**
- Hook optimization for your specific niche
- Script structure that maximizes retention
- Thumbnail + title A/B testing strategy
- Platform-specific algorithm triggers

Ask me about any of these and I'll give you specific, actionable guidance based on your analyzed content!""",
}


def generate_chat_response(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["hook", "opening", "first", "attention", "stop scroll"]):
        return CHAT_RESPONSES["hook"]
    elif any(w in msg for w in ["viral", "views", "reach", "algorithm", "growth"]):
        return CHAT_RESPONSES["viral"]
    elif any(w in msg for w in ["script", "write", "words", "copy", "cta", "improve"]):
        return CHAT_RESPONSES["script"]
    else:
        return CHAT_RESPONSES["default"]


# ─── Comparison Generator ─────────────────────────────────────────────────────

def generate_comparison(videos: list) -> dict:
    if not videos:
        return {}

    winner = max(videos, key=lambda v: v.get("analysis", {}).get("overall_score", 0))
    loser = [v for v in videos if v["id"] != winner["id"]]

    return {
        "winner_id": winner["id"],
        "winner_title": winner.get("title", "Video 1"),
        "winner_reason": f"**{winner.get('title', 'Video 1')}** outperforms across all key metrics. Its hook score ({winner.get('analysis', {}).get('hook_score', 85):.0f}/100) and viral coefficient ({winner.get('analysis', {}).get('viral_score', 88):.0f}/100) are significantly stronger, resulting in an estimated 2-3x better organic reach. The emotional engagement architecture is more sophisticated, using 3 distinct curiosity loops vs 1 in the comparison video.",
        "score_breakdown": {
            "hook": {
                v.get("title", f"Video {i+1}"): v.get("analysis", {}).get("hook_score", 80)
                for i, v in enumerate(videos)
            },
            "viral": {
                v.get("title", f"Video {i+1}"): v.get("analysis", {}).get("viral_score", 80)
                for i, v in enumerate(videos)
            },
            "retention": {
                v.get("title", f"Video {i+1}"): v.get("analysis", {}).get("retention_score", 80)
                for i, v in enumerate(videos)
            },
            "overall": {
                v.get("title", f"Video {i+1}"): v.get("analysis", {}).get("overall_score", 80)
                for i, v in enumerate(videos)
            },
        },
        "recommendations": [
            f"Adopt the hook structure from '{winner.get('title', 'Video 1')}' — it's your strongest performer",
            "The emotional trigger sequencing in the winning video can be templated for future content",
            "Consider testing the pacing style of the top video across your entire content calendar",
            "The CTA in both videos has room for improvement — see the AI suggestions for each",
        ],
        "head_to_head": [
            {"metric": "Hook Strength", "winner": winner.get("title", "Video 1"), "margin": f"+{random.randint(8, 22)} points"},
            {"metric": "Viral Potential", "winner": winner.get("title", "Video 1"), "margin": f"+{random.randint(5, 18)} points"},
            {"metric": "Emotional Resonance", "winner": winner.get("title", "Video 1"), "margin": f"+{random.randint(4, 15)} points"},
            {"metric": "CTA Effectiveness", "winner": "Too close to call", "margin": "< 3 points"},
        ],
    }


# ─── Agent Results Generator ──────────────────────────────────────────────────

AGENTS = [
    {
        "id": "hook-analyzer",
        "name": "Hook Analyzer",
        "description": "Analyzes the first 3-5 seconds of your content for maximum stopping power and attention capture",
        "icon": "🎣",
        "category": "Analysis",
        "capabilities": ["Pattern interrupt detection", "Curiosity gap scoring", "A/B hook variations", "Platform-specific optimization"],
    },
    {
        "id": "viral-predictor",
        "name": "Viral Predictor",
        "description": "Predicts viral potential using 47 signals from top-performing content in your niche",
        "icon": "🚀",
        "category": "Prediction",
        "capabilities": ["Viral coefficient calculation", "Share trigger identification", "Trend alignment scoring", "Growth trajectory modeling"],
    },
    {
        "id": "script-writer",
        "name": "Script Optimizer",
        "description": "Rewrites and optimizes your video scripts for maximum retention and engagement",
        "icon": "✍️",
        "category": "Creation",
        "capabilities": ["Hook rewriting", "Retention arc optimization", "CTA engineering", "Emotional trigger mapping"],
    },
    {
        "id": "audience-analyst",
        "name": "Audience Analyst",
        "description": "Deep-dives into your audience psychology, behavior patterns, and content preferences",
        "icon": "🎯",
        "category": "Insights",
        "capabilities": ["Psychographic profiling", "Pain point extraction", "Content preference mapping", "Engagement pattern analysis"],
    },
    {
        "id": "thumbnail-coach",
        "name": "Thumbnail Coach",
        "description": "Analyzes thumbnail effectiveness and generates high-CTR thumbnail concepts",
        "icon": "🖼️",
        "category": "Visual",
        "capabilities": ["CTR prediction", "Color psychology analysis", "Face/expression guidance", "Text overlay optimization"],
    },
    {
        "id": "trend-spotter",
        "name": "Trend Spotter",
        "description": "Identifies trending content formats, topics, and styles in your niche before they peak",
        "icon": "📈",
        "category": "Intelligence",
        "capabilities": ["Trend detection", "Content gap analysis", "Timing recommendations", "Niche saturation scoring"],
    },
]


def generate_agent_result(agent_id: str, video_context: dict) -> dict:
    title = video_context.get("title", "your video")
    rng = random.Random(agent_id + title)

    if agent_id == "hook-analyzer":
        return {
            "agent": "Hook Analyzer",
            "status": "completed",
            "result": {
                "hook_score": rng.randint(78, 96),
                "pattern_interrupt": True,
                "curiosity_gap_detected": True,
                "attention_capture_seconds": rng.randint(2, 4),
                "hook_type": rng.choice(["Bold Claim", "Curiosity Question", "Shocking Statistic", "Story Tease"]),
                "top_recommendation": f"Your hook creates a strong curiosity gap. Enhance it by adding a specific number: 'The {rng.randint(1,5)}-second trick that...'",
                "alternative_hooks": [
                    f'"I spent {rng.randint(3,12)} months testing this so you don\'t have to..."',
                    f'"What if I told you that {rng.randint(87,97)}% of creators are doing this backwards?"',
                    f'"This is the exact strategy that got me {rng.randint(100,900)}K views last month."',
                ],
            }
        }
    elif agent_id == "viral-predictor":
        return {
            "agent": "Viral Predictor",
            "status": "completed",
            "result": {
                "viral_coefficient": rng.randint(78, 94),
                "predicted_reach_multiplier": round(rng.uniform(2.1, 8.4), 1),
                "share_triggers_found": rng.randint(3, 6),
                "identity_alignment": rng.choice(["Very High", "High", "Medium-High"]),
                "trend_alignment": rng.randint(72, 95),
                "top_insight": "This content has strong 'social currency' value — viewers will share it because it makes them look knowledgeable to their network.",
                "viral_blockers": [
                    "CTA doesn't explicitly ask for shares",
                    "No 'tagging' hook that encourages viewers to tag a friend",
                ],
            }
        }
    elif agent_id == "script-writer":
        return {
            "agent": "Script Optimizer",
            "status": "completed",
            "result": {
                "readability_score": rng.randint(82, 96),
                "optimization_suggestions": 7,
                "estimated_retention_improvement": f"+{rng.randint(12, 28)}%",
                "optimized_hook": f'"In the next {rng.randint(3,8)} minutes, I\'m going to show you exactly how to {title.lower()[:50]}."',
                "optimized_cta": f'"Share this with one person who needs to hear it. See you in Part 2."',
                "key_improvements": [
                    "Add re-engagement hook at the 40% mark",
                    "Replace passive CTA with value-echo CTA",
                    f"Insert 'screenshot this' prompt before key framework point",
                ],
            }
        }
    else:
        return {
            "agent": agent_id.replace("-", " ").title(),
            "status": "completed",
            "result": {
                "score": rng.randint(75, 95),
                "insights_found": rng.randint(4, 9),
                "top_recommendation": f"Strong performance detected in this content. Primary optimization opportunity: engagement at the 60% retention mark.",
                "action_items": [
                    "Implement the identified pattern in your next 3 videos",
                    "A/B test the suggested variation against your current approach",
                    "Monitor the metric for 2 weeks before drawing conclusions",
                ],
            }
        }
