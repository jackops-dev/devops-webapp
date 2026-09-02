import argparse
import sys
import urllib.request
import urllib.error


def check_service(name, url):
    try:
        response = urllib.request.urlopen(url, timeout=3)

        if response.status == 200:
            print(f"[OK] {name} erreichbar")
            return True

        print(f"[WARNUNG] {name} antwortet mit Status {response.status}")
        return False

    except urllib.error.HTTPError as error:
        print(
            f"[HTTP-FEHLER] {name}: "
            f"Status {error.code} ({error.reason})"
        )
        return False

    except urllib.error.URLError as error:
        print(
            f"[NETZWERK-FEHLER] {name} nicht erreichbar: "
            f"{error.reason}"
        )
        return False

    except TimeoutError:
        print(f"[TIMEOUT] {name} antwortet nicht rechtzeitig")
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Prüft die Erreichbarkeit der DevOps-Lab-Services"
    )

    parser.add_argument(
        "--base-url",
        default="http://127.0.0.1:8083",
        help="Basis-URL der Anwendung"
    )

    args = parser.parse_args()

    services = [
        ("Backend Health", f"{args.base_url}/health"),
        ("Kunden API", f"{args.base_url}/kunden")
    ]

    all_ok = True

    for name, url in services:
        if not check_service(name, url):
            all_ok = False

    if all_ok:
        print("[GESAMT] Alle Services erreichbar")
        return 0

    print("[GESAMT] Mindestens ein Service ist nicht erreichbar")
    return 1


if __name__ == "__main__":
    sys.exit(main())