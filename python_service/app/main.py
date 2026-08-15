import os
import time

def main():
    print("PlayDub Python Worker Service initialized successfully.")
    print("Waiting for queue tasks...")
    while True:
        time.sleep(10)

if __name__ == "__main__":
    main()
