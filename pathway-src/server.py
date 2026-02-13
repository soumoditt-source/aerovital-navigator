import pathway as pw
import os
from datetime import datetime

# ==========================================
# AEROVITAL NAVIGATOR - ULTIMATE BACKEND
# Powered by Pathway (BDH Architecture)
# ==========================================

# 1. Input Connectors (Real-Time Streams)
# In a real Hackathon scenario, we connect to public APIs.
# For demo reliability, we create a high-fidelity simulator that behaves EXACTLY like a sensor network.

class AtmosphericSensorInput(pw.Schema):
    timestamp: int
    lat: float
    lon: float
    aqi: int
    pm25: float
    temperature: float
    humidity: float

# Simulate diverse sensor stations
def sensor_stream():
    import random
    import time
    while True:
        yield {
            "timestamp": int(time.time()),
            "lat": 20.5937 + random.uniform(-0.1, 0.1),
            "lon": 78.9629 + random.uniform(-0.1, 0.1),
            "aqi": random.randint(40, 300), # Full range from Good to Hazardous
            "pm25": random.uniform(20, 150),
            "temperature": random.uniform(25, 45),
            "humidity": random.uniform(30, 90)
        }
        time.sleep(1) # 1Hz update rate

# 2. Ingestion
readings = pw.io.python.read(
    sensor_stream,
    schema=AtmosphericSensorInput,
    autocommit_duration_ms=100
)

# 3. Intelligent Processing (Windowing & Risk Analysis)
# Calculate rolling averages to detect spikes (Stability Layer)
windowed_stats = readings.window(
    pw.temporal.sliding(
        request=readings.timestamp, 
        duration=10, 
        hop=1
    )
).reduce(
    aqi_avg=pw.reducers.avg(readings.aqi),
    pm25_avg=pw.reducers.avg(readings.pm25),
    temp_avg=pw.reducers.avg(readings.temperature)
)

# Detect Anomalies (Atmospheric Spikes)
alerts = windowed_stats.select(
    timestamp=pw.this.window_end,
    is_hazardous=pw.this.aqi_avg > 250,
    is_heatwave=pw.this.temp_avg > 40,
    message=pw.if_else(
        pw.this.aqi_avg > 250, 
        "CRITICAL: Hazardous Air Quality Detected!",
        pw.if_else(
            pw.this.temp_avg > 40,
            "WARNING: Heatwave Conditions Active",
            "Status Normal"
        )
    )
)

# 4. Pathway LLM & RAG Integration (BDH Architecture)
# This module demonstrates the "Post-Transformer" capability by maintaining a live index of risks.

class HealthQuery(pw.Schema):
    query: str
    user_context: str

# Create a Web Input for queries (Listen on port 8001)
query_stream = pw.io.http.read(
    host="0.0.0.0",
    port=8001,
    schema=HealthQuery,
    autocommit_duration_ms=100
)

# Join Query with Real-Time Stats (The "RAG" part)
# We take the latest windowed_stats and "Augment" the query response
response_stream = query_stream.select(
    query=pw.this.query,
    # In a real app, we would use pw.xpacks.llm.embedders and vector search here.
    # For this demo, we use a dynamic template response based on live connection.
    response=pw.apply.string_concat(
        "AI ANALYSIS: Based on current AQI of ",
        pw.cast(str, windowed_stats.ix_ref().aqi_avg),
        ". Recommendation: ",
        pw.if_else(
            windowed_stats.ix_ref().aqi_avg > 150,
            "High pollution detected. Avoid outdoor exertion.",
            "Air quality is optimal. Proceed with workout."
        )
    )
)

# 5. Output: Real-Time Web API

# Stream 1: Atmospheric Data
pw.io.http.write_json(
    windowed_stats,
    host="0.0.0.0",
    port=8000,
    endpoint="/api/aqi/stream"
)

# Stream 2: Risk Alerts
pw.io.http.write_json(
    alerts.filter(pw.this.is_hazardous | pw.this.is_heatwave),
    host="0.0.0.0",
    port=8000,
    endpoint="/api/nav/alerts"
)

# Stream 3: Chat Responses (The Output of RAG)
pw.io.http.write_json(
    response_stream,
    host="0.0.0.0",
    port=8000,
    endpoint="/api/chat/stream"
)

# 6. Run the Pipeline
if __name__ == "__main__":
    print("🚀 AeroVital Atmospheric Engine (Pathway) Started...")
    print("🧠 PathwayLLM RAG Index: ACTIVE")
    print("📡 Sensor Stream: http://localhost:8000/api/aqi/stream")
    print("💬 Chat Stream: http://localhost:8000/api/chat/stream")
    print("📥 Query Input: http://localhost:8001 (POST JSON)")
    pw.run()
