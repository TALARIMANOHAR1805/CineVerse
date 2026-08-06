import urllib.request
import time
import json

def time_request(url):
    start = time.time()
    try:
        urllib.request.urlopen(url)
    except Exception as e:
        pass
    end = time.time()
    return end - start

def load_test(endpoint, url, iterations=20):
    print(f"Load testing {endpoint} ({iterations} iterations)...")
    times = []
    for _ in range(iterations):
        times.append(time_request(url))
    
    avg_time = sum(times) / len(times)
    max_time = max(times)
    min_time = min(times)
    print(f"Results for {endpoint}:")
    print(f"  Avg: {avg_time:.3f}s")
    print(f"  Max: {max_time:.3f}s")
    print(f"  Min: {min_time:.3f}s")
    print("-" * 30)
    return avg_time

if __name__ == "__main__":
    search_url = "http://localhost:8080/api/search?query=iron%20man"
    graph_url = "http://localhost:8080/api/graph/related/10138"
    
    search_avg = load_test("/api/search", search_url, 30)
    graph_avg = load_test("/api/graph/related/{id}", graph_url, 30)
    
    if search_avg < 1.0:
        print("PASS: /api/search meets NFR (<1s)")
    else:
        print("FAIL: /api/search did not meet NFR (<1s)")
        
    if graph_avg < 2.0:
        print("PASS: /api/graph/related meets NFR (<2s)")
    else:
        print("FAIL: /api/graph/related did not meet NFR (<2s)")
