import os
import re
import csv

# Chemin à analyser
base_path = r"D:\mon_projet_dungeon_crawler\Marteau-Mandale"

# Extensions à prendre en compte
valid_extensions = [".js", ".html", ".py"]

# Dictionnaire pour stocker toutes les infos
functions_info = {}

# Première passe : trouver les fonctions déclarées dans les .js
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith(".js"):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

                # Fonction classique
                for match in re.findall(r'function\s+(\w+)\s*\(', content):
                    functions_info.setdefault(match, {"DefinedIn": os.path.relpath(file_path, base_path), "Type": "function", "ExportedIn": [], "Usages": []})

                # Fonction fléchée
                for match in re.findall(r'const\s+(\w+)\s*=\s*\(.*?\)\s*=>', content):
                    functions_info.setdefault(match, {"DefinedIn": os.path.relpath(file_path, base_path), "Type": "arrow_function", "ExportedIn": [], "Usages": []})

                # Getter
                for match in re.findall(r'get\s+(\w+)\s*\(', content):
                    functions_info.setdefault(match, {"DefinedIn": os.path.relpath(file_path, base_path), "Type": "getter", "ExportedIn": [], "Usages": []})

                # Setter
                for match in re.findall(r'set\s+(\w+)\s*\(', content):
                    functions_info.setdefault(match, {"DefinedIn": os.path.relpath(file_path, base_path), "Type": "setter", "ExportedIn": [], "Usages": []})

                # Export { fonction }
                for match in re.findall(r'export\s*\{([^}]+)\}', content):
                    exported_funcs = [func.strip() for func in match.split(',')]
                    for func in exported_funcs:
                        if func in functions_info:
                            functions_info[func]["ExportedIn"].append(os.path.relpath(file_path, base_path))

                # Export direct
                for match in re.findall(r'export\s+function\s+(\w+)\s*\(', content):
                    if match in functions_info:
                        functions_info[match]["ExportedIn"].append(os.path.relpath(file_path, base_path))

# Deuxième passe : trouver les utilisations dans .js, .html, .py
for root, dirs, files in os.walk(base_path):
    for file in files:
        if any(file.endswith(ext) for ext in valid_extensions):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                    for line_number, line in enumerate(lines, start=1):
                        for func_name in functions_info.keys():
                            # Repérer usage direct, window., this., obj., etc
                            pattern = rf'(\b|\.){re.escape(func_name)}\s*\('
                            if re.search(pattern, line):
                                functions_info[func_name]["Usages"].append({
                                    "File": os.path.relpath(file_path, base_path),
                                    "LineNumber": line_number,
                                    "LineContent": line.strip()
                                })
            except Exception as e:
                print(f"Erreur lecture fichier {file_path}: {e}")

# Exporter en CSV
with open(r"D:\mon_projet_dungeon_crawler\Marteau-Mandale\liste_fonction.csv", "w", newline='', encoding="utf-8") as csvfile:
    fieldnames = ["FunctionName", "Type", "DefinedIn", "ExportedIn", "UsageFile", "UsageLineNumber", "UsageLineContent"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames, delimiter=";")
    writer.writeheader()

    for func_name, info in functions_info.items():
        if info["Usages"]:
            for usage in info["Usages"]:
                row = {
                    "FunctionName": func_name,
                    "Type": info["Type"],
                    "DefinedIn": info["DefinedIn"],
                    "ExportedIn": ",".join(info["ExportedIn"]),
                    "UsageFile": usage["File"],
                    "UsageLineNumber": usage["LineNumber"],
                    "UsageLineContent": usage["LineContent"]
                }
                writer.writerow(row)
        else:
            row = {
                "FunctionName": func_name,
                "Type": info["Type"],
                "DefinedIn": info["DefinedIn"],
                "ExportedIn": ",".join(info["ExportedIn"]),
                "UsageFile": "",
                "UsageLineNumber": "",
                "UsageLineContent": ""
            }
            writer.writerow(row)

print("✅ Analyse finie : CSV généré dans D:\mon_projet_dungeon_crawler\Marteau-Mandale\liste_fonction.csv")
