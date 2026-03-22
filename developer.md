**Release workflow going forward:**

```bash
cd ~/InstaPageScrape-Ecommerce
# make your changes...
git add -A
git commit -m "your message"
git push
bash setup.sh
gh release create v1.3 ~/instascraper_auto/instapagescrape.zip --title "v1.3 — ..." --notes "..."
# Action auto-updates the SVG badge to v1.3 ✅
```
