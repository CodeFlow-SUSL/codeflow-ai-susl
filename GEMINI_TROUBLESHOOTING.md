# Gemini AI Troubleshooting Guide

## Error: "Failed to generate AI insights. Using fallback suggestions."

This error indicates that the Gemini AI service failed to generate insights. Follow these steps to diagnose and fix the issue:

### Step 1: Verify Settings

1. Open VS Code Settings (Ctrl+,)
2. Search for "codeflow"
3. Check these settings:

```json
{
  "codeflow.useGeminiAI": true,  // Must be true
  "codeflow.geminiApiKey": "YOUR_API_KEY_HERE"  // Must be a valid key
}
```

### Step 2: Verify API Key

Your API key should:
- Start with "AIza"
- Be 39 characters long
- Have no extra spaces or quotes

**Get a valid API key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Paste it in VS Code settings: `codeflow.geminiApiKey`

### Step 3: Check Console Output

1. Open VS Code **Developer Tools**: `Help > Toggle Developer Tools`
2. Go to the **Console** tab
3. Look for error messages from Gemini Service
4. Common errors and solutions:

#### "Gemini AI is disabled in settings"
**Solution:** Set `codeflow.useGeminiAI` to `true`

#### "Gemini API key is missing or empty"
**Solution:** Add your API key to `codeflow.geminiApiKey`

#### "API key not valid"
**Solution:** Your API key is invalid. Generate a new one from Google AI Studio

#### "Resource has been exhausted (e.g. check quota)"
**Solution:** You've exceeded your free quota. Wait 24 hours or upgrade your API plan

#### "Network error" or "fetch failed"
**Solution:** Check your internet connection and firewall settings

### Step 4: Test the Connection

The enhanced Gemini Service now logs detailed information:

1. Reload the extension: `Ctrl+Shift+P` → "Developer: Reload Window"
2. Open Developer Tools Console
3. Generate a weekly report
4. Look for these logs:

```
Initializing Gemini Service...
Gemini AI Enabled: true
API Key Present: true
Gemini AI initialized successfully
Generating Gemini AI insights...
Sending request to Gemini API...
Received response from Gemini API
Successfully generated Gemini insights
```

If you see an error at any step, the console will show the specific issue.

### Step 5: Common Issues

#### Issue: API Key Not Working
**Symptoms:** Error "API key not valid"

**Solutions:**
1. Regenerate API key from Google AI Studio
2. Make sure you're using the correct Google account
3. Verify API key has no extra spaces or quotes
4. Check if Gemini API is enabled in your Google Cloud project

#### Issue: Quota Exceeded
**Symptoms:** Error "Resource has been exhausted"

**Solutions:**
1. Wait 24 hours (free tier resets daily)
2. Upgrade to paid plan at [Google Cloud Console](https://console.cloud.google.com/)
3. Check your usage at [Google AI Studio](https://makersuite.google.com/)

#### Issue: Network/Firewall
**Symptoms:** "fetch failed" or "network error"

**Solutions:**
1. Check internet connection
2. Verify firewall allows HTTPS to `generativelanguage.googleapis.com`
3. If behind a proxy, configure VS Code proxy settings
4. Try disabling VPN temporarily

#### Issue: Response Parsing Error
**Symptoms:** "Error parsing Gemini JSON response"

**Solutions:**
1. This is usually temporary - try generating report again
2. The service automatically falls back to text parsing
3. Check console for actual response (first 500 chars shown)
4. If persistent, the API might be returning unexpected format

### Step 6: Fallback Mode

If Gemini AI fails, the extension automatically uses smart fallback suggestions based on your coding patterns. These suggestions are still valuable and contextual!

**Fallback suggestions are based on:**
- Your productivity score
- Coding activity patterns
- Most used commands
- File types you work with
- Time of day patterns

### Step 7: Manual Test (Advanced)

If issues persist, test the API directly:

```javascript
// Open VS Code Developer Console and run:
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Hello' }] }]
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Replace `YOUR_API_KEY` with your actual key. This will show if the API is reachable.

### Enhanced Error Messages

The improved Gemini Service now shows specific error messages:
- ✓ "Invalid Gemini API key. Please check your settings."
- ✓ "Gemini API quota exceeded. Using fallback suggestions."
- ✓ "Network error connecting to Gemini API. Using fallback suggestions."
- ✓ "Gemini model not initialized. Please check your API key in settings."

## Still Having Issues?

If none of the above helps:

1. **Check the logs**: Look at the full error stack in Developer Console
2. **Verify Google AI Studio access**: Make sure you can access https://makersuite.google.com/
3. **Test with curl**: 
   ```bash
   curl -X POST \
     'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY' \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```
4. **Check Google Cloud Console**: Verify Gemini API is enabled
5. **Try a different network**: Could be corporate firewall issue

## Success Indicators

When everything works correctly, you'll see:
- ✓ Console logs showing successful initialization
- ✓ Detailed insights in 5 categories (Code Improvements, Performance Tips, etc.)
- ✓ Relevant, contextual suggestions based on your actual coding patterns
- ✓ No error messages in console

## Rate Limits (Free Tier)

- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per minute**

If you hit these limits, wait a bit or upgrade to paid tier.
