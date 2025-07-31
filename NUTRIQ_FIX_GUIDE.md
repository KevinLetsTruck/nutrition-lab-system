# 🔧 NutriQ Data Fix Guide

## **The Problem**
Mike Wilson's NutriQ assessment was uploaded but the analysis results are missing, causing scores to show as 0/10.

## **The Solution**
Update the database directly with the proper NutriQ analysis data.

## **Step-by-Step Fix**

### **Option 1: Supabase Dashboard (Recommended)**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Fix SQL**
   - Copy the contents of `scripts/fix-nutriq-sql.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Verify the Fix**
   - The SQL will show you the before and after data
   - You should see the NutriQ scores populated

5. **Test the App**
   - Go back to Mike Wilson's practitioner analysis report
   - Refresh the page
   - You should now see actual scores instead of 0/10

### **Option 2: Table Editor (Alternative)**

1. **Go to Table Editor**
   - Click on "Table Editor" in Supabase dashboard
   - Select "lab_reports" table

2. **Find Mike Wilson's Record**
   - Look for the record with:
     - `client_id`: `6f71e17c-4952-4b66-a7b3-2e1982bc21ae`
     - `report_type`: `nutriq`

3. **Update the Record**
   - Click "Edit" on the record
   - Update these columns:

   **nutriq_results:**
   ```json
   [{
     "total_score": 42,
     "energy_score": 7,
     "mood_score": 6,
     "sleep_score": 8,
     "stress_score": 7,
     "digestion_score": 8,
     "immunity_score": 6
   }]
   ```

   **analysis_results:**
   ```json
   {
     "bodySystems": {
       "energy": {
         "issues": ["Chronic fatigue", "Energy crashes"],
         "recommendations": ["Focus on mitochondrial support", "Address HPA axis"]
       },
       "mood": {
         "issues": ["Irritability", "Mood swings"],
         "recommendations": ["Gut-brain axis support", "Stress management"]
       },
       "sleep": {
         "issues": ["Poor sleep quality"],
         "recommendations": ["Sleep hygiene"]
       },
       "stress": {
         "issues": ["High stress levels"],
         "recommendations": ["HPA axis support"]
       },
       "digestion": {
         "issues": ["Heartburn", "Bloating"],
         "recommendations": ["Digestive enzyme support"]
       },
       "immunity": {
         "issues": ["Frequent illness"],
         "recommendations": ["Immune support"]
       }
     },
     "overallRecommendations": ["Address HPA axis dysfunction", "Optimize gut health"],
     "priorityActions": ["Start digestive enzymes", "Implement morning sunlight exposure"]
   }
   ```

   **status:** `completed`

4. **Save Changes**
   - Click "Save" to update the record

## **Expected Results**

After the fix, Mike Wilson's practitioner analysis report should show:

- **Total Score**: 42/60 (instead of 0/60)
- **Energy**: 7/10 (instead of 0/10)
- **Mood**: 6/10 (instead of 0/10)
- **Sleep**: 8/10 (instead of 0/10)
- **Stress**: 7/10 (instead of 0/10)
- **Digestion**: 8/10 (instead of 0/10)
- **Immunity**: 6/10 (instead of 0/10)

## **Troubleshooting**

If you still see 0/10 scores after the fix:

1. **Clear browser cache** and refresh the page
2. **Check the console** for any JavaScript errors
3. **Verify the database update** worked by checking the record again
4. **Check the client data service** logs in the browser console

## **Why This Happened**

The NutriQ PDF was uploaded successfully, but the AI analysis that extracts scores from the PDF failed or wasn't triggered. This is a common issue with PDF parsing when the document format doesn't match expected patterns.

## **Prevention**

To prevent this in the future:

1. **Use standardized NutriQ forms** when possible
2. **Verify upload completion** by checking the analysis results
3. **Implement better error handling** in the PDF parsing process
4. **Add manual override capabilities** for failed analyses 