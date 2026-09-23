import os
import datetime
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from fastapi.middleware.cors import CORSMiddleware
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig

app = FastAPI(title="AI Tech Watch Agent powered by Crawl4AI")

# Secure CORS handling with robust fallback string parsing
frontend_origins = os.getenv("FRONTEND_ORIGINS", "")
allowed_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structural validation: Enforce required API Keys on application bootstrap
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("CRITICAL: 'GROQ_API_KEY' environment variable is missing.")

# Initialize Open-Source LLM via Groq API Gateway (Temperature 0.2 for analytical accuracy)
llm = ChatGroq(
    temperature=0.2,
    model_name="qwen/qwen3.8-27b",
    groq_api_key=GROQ_API_KEY,
    default_headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "X-Title": "AI-Tech-Watch-Agent"
    }
)

class WatchRequest(BaseModel):
    topic: str = Field(..., description="The technological keyword or topic to search for.")
    urls: list[str] = Field(..., description="List of target websites to extract data from.")

class TechReport(BaseModel):
    topic: str
    summary: str
    key_trends: list[str]
    impact_score: int = Field(
        ..., 
        description=(
            "An integer score from 0 to 100 evaluating the technology's disruption potential. "
            "Use this matrix to calculate it: "
            "1-20: Minor update or local niche business news. "
            "21-50: Solid incremental innovation or new competitive product. "
            "51-80: Major breakthrough, heavy funding, or massive industry adoption trend. "
            "81-100: Total paradigm shift, standard-breaking invention, or market disruption."
        )
    )

@app.post("/api/watch", response_model=TechReport)
async def run_tech_watch(request: WatchRequest):
    if not request.urls:
        raise HTTPException(status_code=400, detail="Please provide at least one valid target URL.")

    scraped_content = []

    try:
        # STEP 1: Headless Browser Configuration tailored for low-spec VPS environments
        browser_config = BrowserConfig(
            headless=True,
            extra_args=[
                "--disable-gpu", 
                "--disable-dev-shm-usage", 
                "--no-sandbox",
                "--single-process"
            ]
        )
        
        # STEP 2: Strict content extraction parameters to strip junk layouts
        run_config = CrawlerRunConfig(
            cache_mode="BYPASS",
            exclude_external_links=True,
            remove_overlay_elements=True
        )

        # Execute asynchronous parallel scraping sessions
        print(f"[FastAPI Agent] Triggering multi-page crawl for {len(request.urls)} links...")
        async with AsyncWebCrawler(config=browser_config) as crawler:
            results = await crawler.arun_many(urls=request.urls, config=run_config)
            
            for res in results:
                if res.success:
                    # Enforce context truncation window to guard LLM token limitations
                    scraped_content.append(f"--- Source: {res.url} ---\n{res.markdown[:6000]}")
                else:
                    print(f"[Crawler Warning] Resource failed: {res.url}. Context: {res.error_message}")
                    scraped_content.append(f"--- Failed Resource: {res.url} ({res.error_message}) ---")

        all_web_data = "\n\n".join(scraped_content)

        # STEP 3: LangChain Extraction Pipeline orchestration
        parser = JsonOutputParser(pydantic_object=TechReport)
        current_date = datetime.date.today().strftime("%B %d, %Y")
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", (
                "You are an elite Tech Intelligence Agent. Today's current date is {current_date}.\n"
                "Analyze the live scraped web raw chunks and summarize the findings.\n"
                "You MUST respond exclusively using a valid JSON structure following this schema layout:\n"
                "{format_instructions}"
            )),
            ("user", "Technology Target Topic: '{topic}'\n\nLive Scraped Data Payload:\n{data}")
        ]).partial(format_instructions=parser.get_format_instructions())

        chain_to_llm = prompt | llm
        
        print(f"[FastAPI Agent] Streaming evaluation pipeline to Groq orchestration layer...")
        raw_message = await chain_to_llm.ainvoke({
            "topic": request.topic, 
            "data": all_web_data, 
            "current_date": current_date
        })
        
        # Safe telemetry token consumption analysis logs
        metadata = getattr(raw_message, 'response_metadata', {})
        usage = metadata.get('token_usage', getattr(raw_message, 'usage_metadata', {}))
        
        if usage:
            print("\n📊 === GROQ TOKEN CONSUMPTION REPORT ===")
            print(f"🔹 Prompt Tokens   : {usage.get('prompt_tokens', usage.get('input_tokens', 0))}")
            print(f"🔹 Response Tokens : {usage.get('completion_tokens', usage.get('output_tokens', 0))}")
            print(f"🔹 Total Volume    : {usage.get('total_tokens', 0)}")
            print("=========================================\n")

        return parser.parse(raw_message.content)

    except Exception as e:
        print(f"[FastAPI Critical Exception]: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI engine pipeline breakdown: {str(e)}")
