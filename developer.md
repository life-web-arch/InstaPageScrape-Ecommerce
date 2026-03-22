
# Remove local repo and build folder
```
cd 
rm -rf ~/InstaPageScrape-Ecommerce
rm -rf ~/instascraper_auto
rm -f ~/instapagescrape.zip
rm -f ~/fix.py

# Verify everything is gone
ls ~ | grep -i "insta\|scraper\|fix"

echo "✅ All local files deleted"
```
---


## Clone Repo

```bash
gh repo clone InstaPageScrape-Ecommerce
cd InstaPageScrape-Ecommerce
bash setup.sh
```
---

**Release workflow going forward:**

```bash
cd ~/InstaPageScrape-Ecommerce
# make your changes...
git add -A
git commit -m "your message"
git push
bash setup.sh
gh release create v1.5 ~/instascraper_auto/instapagescrape.zip --title "v1.3 — ..." --notes "..."
# Action auto-updates the SVG badge to v1.5 ✅
```
