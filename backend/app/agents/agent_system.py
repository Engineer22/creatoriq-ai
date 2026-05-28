"""
CreatorIQ AI - Multi-Agent System
Specialized AI agents for deep video content analysis
"""
import json
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional

import google.generativeai as genai
from google.generativeai.types import HarmBlockThreshold, HarmCategory

from app.core.config import settings

logger = logging.getLogger(__name__)


class BaseAgent:
    """Base class for all CreatorIQ AI agents"""

    name: str = "Base Agent"
    description: str = "Base AI agent"
    emoji: str = "🤖"

    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            },
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=2048,
            ),
        )

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError


class HookAgent(BaseAgent):
    """Specialized agent for hook analysis and optimization"""

    name = "Hook Agent"
    description = "Analyzes and optimizes video hooks for maximum attention retention"
    emoji = "🎣"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        transcript = context.get("transcript", "No transcript")
        title = context.get("title", "Unknown")
        platform = context.get("platform", "unknown")

        prompt = f"""You are the Hook Agent, a specialist in the psychology of attention and video hook optimization.

Analyze the hook of this {platform.upper()} video: "{title}"

First 300 chars of transcript:
{transcript[:300] if transcript else "No transcript available"}

Provide a detailed hook analysis in JSON:
{{
  "hook_type": "<pattern interrupt|question|bold statement|story|shock|controversy|promise>",
  "hook_duration": "<estimated seconds of the hook>",
  "psychological_mechanism": "<primary psychological trigger used>",
  "attention_score": <0-100>,
  "first_3_seconds": "<what happens>",
  "curiosity_gap_created": "<yes/no and description>",
  "emotional_opening": "<what emotion is triggered immediately>",
  "specific_weaknesses": ["<weakness 1>", "<weakness 2>"],
  "optimized_hook_v1": "<rewritten hook version 1 - more direct>",
  "optimized_hook_v2": "<rewritten hook version 2 - curiosity-based>",
  "optimized_hook_v3": "<rewritten hook version 3 - emotional>",
  "hook_frameworks_applied": ["<framework 1>", "<framework 2>"],
  "platform_specific_advice": "<specific advice for {platform}>"
}}"""

        try:
            response = await self.model.generate_content_async(prompt)
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
            return {"agent": self.name, "result": json.loads(raw)}
        except Exception as e:
            logger.error(f"HookAgent error: {e}")
            return {"agent": self.name, "error": str(e)}


class RetentionAgent(BaseAgent):
    """Specialized agent for retention analysis"""

    name = "Retention Agent"
    description = "Analyzes viewer retention patterns and drop-off points"
    emoji = "📈"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        transcript = context.get("transcript", "")
        duration = context.get("duration", 60)
        title = context.get("title", "Unknown")
        platform = context.get("platform", "unknown")

        prompt = f"""You are the Retention Agent, an expert in viewer psychology and retention optimization.

Video: "{title}" ({platform.upper()})
Duration: {duration} seconds

Transcript:
{transcript[:2000] if transcript else "No transcript available"}

Analyze retention mechanics in JSON:
{{
  "predicted_avg_watch_percentage": <0-100>,
  "critical_drop_points": [
    {{"timestamp_pct": <0-100>, "reason": "<why viewers might drop here>"}},
    {{"timestamp_pct": <0-100>, "reason": "<reason>"}}
  ],
  "re_engagement_moments": [
    {{"timestamp_pct": <0-100>, "technique": "<what keeps viewers watching>"}}
  ],
  "pacing_assessment": "<fast/medium/slow and explanation>",
  "pattern_interrupts_count": <number>,
  "pattern_interrupts_found": ["<interrupt 1>", "<interrupt 2>"],
  "information_density": "<high/medium/low - is there enough value packed in?>",
  "curiosity_maintenance": "<how well does the video maintain curiosity throughout?>",
  "loop_closure": "<does the video satisfyingly answer the hook promise? yes/partial/no>",
  "retention_tactics_used": ["<tactic 1>", "<tactic 2>", "<tactic 3>"],
  "recommended_edits": [
    {{"edit": "<specific edit>", "expected_lift": "<e.g., +5% retention at 30s>"}},
    {{"edit": "<edit>", "expected_lift": "<lift>"}}
  ],
  "optimal_length_for_content": "<what the ideal duration should be and why>"
}}"""

        try:
            response = await self.model.generate_content_async(prompt)
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
            return {"agent": self.name, "result": json.loads(raw)}
        except Exception as e:
            logger.error(f"RetentionAgent error: {e}")
            return {"agent": self.name, "error": str(e)}


class EmotionAgent(BaseAgent):
    """Specialized agent for emotional analysis"""

    name = "Emotion Agent"
    description = "Maps the emotional journey and psychological triggers in content"
    emoji = "❤️"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        transcript = context.get("transcript", "")
        title = context.get("title", "Unknown")
        platform = context.get("platform", "unknown")
        top_comments = context.get("top_comments", [])

        comments_text = "\n".join([c.get("text", "")[:100] for c in top_comments[:5]])

        prompt = f"""You are the Emotion Agent, a psychologist specializing in content emotional mechanics.

Video: "{title}" ({platform.upper()})
Transcript: {transcript[:1500] if transcript else "No transcript"}
Top Comments: {comments_text if comments_text else "None"}

Map the emotional journey in JSON:
{{
  "primary_emotion": "<dominant emotion evoked>",
  "emotional_journey": [
    {{"phase": "opening", "emotion": "<emotion>", "intensity": <0-10>}},
    {{"phase": "middle", "emotion": "<emotion>", "intensity": <0-10>}},
    {{"phase": "end", "emotion": "<emotion>", "intensity": <0-10>}}
  ],
  "psychological_triggers": [
    {{"trigger": "<trigger name>", "how_used": "<specific usage>", "effectiveness": <0-10>}}
  ],
  "audience_psychology_match": "<how well the emotional arc matches target audience psychology>",
  "comment_sentiment": "<positive/mixed/negative - based on comments>",
  "shareability_emotion": "<which emotion most likely drives sharing>",
  "nostalgia_factor": <0-10>,
  "aspiration_factor": <0-10>,
  "relatability_factor": <0-10>,
  "entertainment_factor": <0-10>,
  "educational_factor": <0-10>,
  "emotion_optimization_tips": [
    "<tip 1 to amplify the right emotions>",
    "<tip 2>",
    "<tip 3>"
  ],
  "missing_emotional_beats": ["<emotion that would strengthen the piece>"]
}}"""

        try:
            response = await self.model.generate_content_async(prompt)
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
            return {"agent": self.name, "result": json.loads(raw)}
        except Exception as e:
            logger.error(f"EmotionAgent error: {e}")
            return {"agent": self.name, "error": str(e)}


class TrendAgent(BaseAgent):
    """Specialized agent for trend and virality analysis"""

    name = "Trend Agent"
    description = "Analyzes viral mechanics, trending patterns, and shareability factors"
    emoji = "🔥"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        title = context.get("title", "Unknown")
        platform = context.get("platform", "unknown")
        hashtags = context.get("hashtags", [])
        views = context.get("views")
        likes = context.get("likes")
        description = context.get("description", "")

        prompt = f"""You are the Trend Agent, an expert in viral mechanics and platform algorithms.

Video: "{title}" ({platform.upper()})
Views: {views or "Unknown"} | Likes: {likes or "Unknown"}
Hashtags: {', '.join(hashtags) if hashtags else "None"}
Description: {description[:300] if description else "None"}

Analyze viral potential in JSON:
{{
  "viral_probability": <0-100>,
  "virality_category": "<mega-viral|highly-viral|moderately-viral|low-viral>",
  "shareability_score": <0-100>,
  "trend_alignment": "<is this aligned with current trends?>",
  "platform_algorithm_factors": [
    {{"factor": "<algorithm factor>", "assessment": "<how well this video performs>", "score": <0-10>}}
  ],
  "social_currency_elements": ["<element 1>", "<element 2>"],
  "hashtag_strategy": {{
    "current_effectiveness": "<assessment>",
    "recommended_hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "hashtag_mix": "<niche/medium/trending ratio recommendation>"
  }},
  "best_posting_times": ["<time 1>", "<time 2>"],
  "cross_platform_potential": {{
    "youtube_shorts": <0-10>,
    "tiktok": <0-10>,
    "instagram_reels": <0-10>
  }},
  "trending_formats_utilized": ["<format 1>", "<format 2>"],
  "missing_viral_elements": ["<missing element 1>", "<missing element 2>"],
  "viral_optimization_recommendations": [
    "<recommendation 1>",
    "<recommendation 2>",
    "<recommendation 3>"
  ]
}}"""

        try:
            response = await self.model.generate_content_async(prompt)
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
            return {"agent": self.name, "result": json.loads(raw)}
        except Exception as e:
            logger.error(f"TrendAgent error: {e}")
            return {"agent": self.name, "error": str(e)}


class ScriptAgent(BaseAgent):
    """Specialized agent for script improvement"""

    name = "Script Agent"
    description = "Rewrites and optimizes video scripts for maximum engagement"
    emoji = "✍️"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        transcript = context.get("transcript", "")
        title = context.get("title", "Unknown")
        platform = context.get("platform", "unknown")
        duration = context.get("duration", 60)

        if not transcript:
            return {
                "agent": self.name,
                "result": {"error": "No transcript available for script improvement"},
            }

        prompt = f"""You are the Script Agent, a professional scriptwriter for viral {platform.upper()} content.

Original Video: "{title}" ({duration}s)

Original Script/Transcript:
{transcript[:2000]}

Rewrite and optimize in JSON:
{{
  "script_assessment": {{
    "clarity": <0-10>,
    "flow": <0-10>,
    "engagement": <0-10>,
    "brevity": <0-10>,
    "overall": <0-10>
  }},
  "structural_issues": ["<issue 1>", "<issue 2>"],
  "optimized_script": "<full rewritten script optimized for {platform} - maintain creator voice but maximize engagement>",
  "word_count_original": <number>,
  "word_count_optimized": <number>,
  "key_changes_made": [
    {{"change": "<what was changed>", "reason": "<why this improves the video>"}}
  ],
  "power_words_added": ["<word 1>", "<word 2>", "<word 3>"],
  "filler_words_removed": ["<word/phrase 1>", "<word/phrase 2>"],
  "pacing_notes": "<notes on delivery pacing for the new script>",
  "b_roll_suggestions": [
    {{"timestamp": "<0:00-0:05>", "b_roll": "<what to show>", "why": "<why this helps>"}}
  ]
}}"""

        try:
            response = await self.model.generate_content_async(prompt)
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
            return {"agent": self.name, "result": json.loads(raw)}
        except Exception as e:
            logger.error(f"ScriptAgent error: {e}")
            return {"agent": self.name, "error": str(e)}


class ThumbnailAgent(BaseAgent):
    """Specialized agent for thumbnail analysis and optimization"""

    name = "Thumbnail Agent"
    description = "Analyzes CTR potential and provides thumbnail optimization recommendations"
    emoji = "🖼️"

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        title = context.get("title", "Unknown")
        platform = context.get("platform", "unknown")
        thumbnail_url = context.get("thumbnail_url")
        views = context.get("views")

        prompt = f"""You are the Thumbnail Agent, a CTR optimization expert.

Video: "{title}" ({platform.upper()})
Thumbnail URL: {thumbnail_url or "Not available"}
Views: {views or "Unknown"}

Even without seeing the thumbnail image, analyze and provide recommendations based on the title and context.

Return JSON:
{{
  "estimated_ctr_potential": <0-100>,
  "thumbnail_best_practices": [
    {{"practice": "<best practice>", "importance": "high|medium|low"}}
  ],
  "recommended_thumbnail_concepts": [
    {{
      "concept": "<concept name>",
      "description": "<detailed description of what to create>",
      "text_overlay": "<text to add to thumbnail>",
      "emotion_to_convey": "<primary emotion>",
      "color_scheme": "<recommended colors>"
    }}
  ],
  "title_thumbnail_synergy": "<advice on making title and thumbnail work together>",
  "face_expression_advice": "<what facial expression/body language to use>",
  "text_overlay_advice": "<specific text overlay recommendations>",
  "color_psychology": "<color recommendations and why>",
  "ab_test_ideas": [
    "<variation 1 to A/B test>",
    "<variation 2>"
  ],
  "platform_specific_specs": {{
    "optimal_dimensions": "<dimensions>",
    "safe_zones": "<where to place key elements>",
    "mobile_optimization": "<how to optimize for mobile viewing>"
  }}
}}"""

        try:
            response = await self.model.generate_content_async(prompt)
            raw = response.text.strip()
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
            return {"agent": self.name, "result": json.loads(raw)}
        except Exception as e:
            logger.error(f"ThumbnailAgent error: {e}")
            return {"agent": self.name, "error": str(e)}


class AgentOrchestrator:
    """Orchestrates multiple specialized agents for comprehensive analysis"""

    AGENTS = {
        "hook": HookAgent,
        "retention": RetentionAgent,
        "emotion": EmotionAgent,
        "trend": TrendAgent,
        "script": ScriptAgent,
        "thumbnail": ThumbnailAgent,
    }

    async def run_agent(
        self, agent_name: str, video_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run a single specific agent"""
        agent_class = self.AGENTS.get(agent_name)
        if not agent_class:
            raise ValueError(f"Unknown agent: {agent_name}. Available: {list(self.AGENTS.keys())}")

        agent = agent_class()
        return await agent.run(video_context)

    async def run_all_agents(
        self, video_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run all agents in parallel for comprehensive analysis"""
        import asyncio

        tasks = {
            name: agent_class().run(video_context)
            for name, agent_class in self.AGENTS.items()
        }

        results = {}
        for name, task in tasks.items():
            try:
                results[name] = await task
            except Exception as e:
                logger.error(f"Agent {name} failed: {e}")
                results[name] = {"agent": name, "error": str(e)}

        return {
            "agents_run": list(results.keys()),
            "results": results,
            "summary": self._build_summary(results),
        }

    async def stream_agent(
        self, agent_name: str, video_context: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """Stream an agent's analysis with status updates"""
        import json as json_module

        agent_class = self.AGENTS.get(agent_name)
        if not agent_class:
            yield f"data: {json_module.dumps({'type': 'error', 'message': f'Unknown agent: {agent_name}'})}\n\n"
            return

        agent = agent_class()
        yield f"data: {json_module.dumps({'type': 'status', 'message': f'Running {agent.name}...'})}\n\n"

        try:
            result = await agent.run(video_context)
            yield f"data: {json_module.dumps({'type': 'result', 'agent': agent_name, 'data': result})}\n\n"
            yield f"data: {json_module.dumps({'type': 'done'})}\n\n"
        except Exception as e:
            yield f"data: {json_module.dumps({'type': 'error', 'message': str(e)})}\n\n"

    def _build_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Build a summary from all agent results"""
        summary = {
            "agents_completed": [],
            "agents_failed": [],
            "top_recommendations": [],
        }

        for name, result in results.items():
            if "error" in result:
                summary["agents_failed"].append(name)
            else:
                summary["agents_completed"].append(name)

        return summary

    def list_agents(self) -> List[Dict[str, str]]:
        """List all available agents"""
        return [
            {
                "id": name,
                "name": agent_class.name,
                "description": agent_class.description,
                "emoji": agent_class.emoji,
            }
            for name, agent_class in self.AGENTS.items()
        ]
