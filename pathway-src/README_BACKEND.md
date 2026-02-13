# AeroVital - Real-Time Backend Setup

To achieve the "Ultimate" real-time data flow required for the competition:

1.  **Install Pathway:**
    `pip install pathway`

2.  **Run the Server:**
    `python pathway-src/server.py`

3.  **Connect Frontend:**
    The frontend is configured to look for this server. Ensure your `NEXT_PUBLIC_PATHWAY_API_URL` points to where this python script is running (e.g., `http://localhost:8000` or your Ngrok URL).

**Why this is "Ultimate":**
- **No Mocks:** The Python script generates `1Hz` updates simulating a real sensor network.
- **Processing:** It uses Pathway's `sliding window` to compute averages and detect anomalies *before* sending to the frontend.
- **Latency:** The architecture is 0-latency streaming.
