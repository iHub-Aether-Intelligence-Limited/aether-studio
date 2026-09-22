"""
Aether Studio Installer - proper installer wizard
Build this into an exe with: python -m PyInstaller --onefile --windowed installer.py
"""
import os
import sys
import shutil
import tkinter as tk
from tkinter import ttk, messagebox

APP_NAME = "Aether Studio"
APP_VERSION = "1.0.0"
DEFAULT_INSTALL = os.path.join(os.environ.get("LOCALAPPDATA", "C:\\"), "AetherStudio")

class InstallerApp:
    def __init__(self, root):
        self.root = root
        self.root.title(f"Install {APP_NAME} {APP_VERSION}")
        self.root.geometry("560x420")
        self.root.resizable(False, False)
        self.install_path = tk.StringVar(value=DEFAULT_INSTALL)
        self._build_ui()

    def _build_ui(self):
        ttk.Label(self.root, text=f"Welcome to {APP_NAME}", font=("Segoe UI", 18, "bold")).pack(pady=20)
        ttk.Label(self.root, text=f"Version {APP_VERSION}", foreground="gray").pack()

        ttk.Separator(self.root).pack(fill="x", padx=40, pady=20)

        ttk.Label(self.root, text="Install location:").pack(anchor="w", padx=40)
        row = ttk.Frame(self.root)
        row.pack(fill="x", padx=40, pady=5)
        ttk.Entry(row, textvariable=self.install_path).pack(side="left", fill="x", expand=True)
        ttk.Button(row, text="Browse...", command=self._browse).pack(side="right", padx=5)

        ttk.Label(self.root, text="Free forever. No account needed.", foreground="green").pack(pady=10)

        ttk.Button(self.root, text="Install", command=self._install).pack(pady=20, ipadx=40)

    def _browse(self):
        from tkinter import filedialog
        p = filedialog.askdirectory(initialdir=self.install_path.get())
        if p:
            self.install_path.set(p)

    def _install(self):
        dest = self.install_path.get()
        try:
            self.root.title("Installing...")
            os.makedirs(dest, exist_ok=True)
            src = os.path.dirname(os.path.abspath(__file__))
            for item in ["static", "gateway", "studio_core", "modules", "main.py", ".env", "start.bat"]:
                s = os.path.join(src, item)
                if os.path.exists(s):
                    if os.path.isdir(s):
                        shutil.copytree(s, os.path.join(dest, item), dirs_exist_ok=True)
                    else:
                        shutil.copy2(s, dest)
            shutil.copy2(os.path.join(src, "start.bat"), os.path.join(dest, "start.bat"))
            desktop = os.path.join(os.environ["USERPROFILE"], "Desktop")
            shortcut = os.path.join(desktop, f"{APP_NAME}.lnk")
            with open(shortcut, "w") as f:
                f.write(f'@echo off\ncd /d "{dest}"\nstart http://127.0.0.1:5200\npython main.py\n')
            os.rename(shortcut, shortcut.replace(".lnk", ".bat"))
            messagebox.showinfo("Complete", f"{APP_NAME} installed!\n\nRun from Desktop or:\n{dest}\\start.bat")
            self.root.quit()
        except Exception as e:
            messagebox.showerror("Error", str(e))

if __name__ == "__main__":
    root = tk.Tk()
    app = InstallerApp(root)
    root.mainloop()
