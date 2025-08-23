# Autocomplete Population Fix

## Issue
When selecting a medication or supplement from the dropdown, the name field was not populating correctly, although the dosage field was being auto-filled.

## Root Cause
The SimpleAutocomplete component had been modified to use a Button as the trigger instead of an Input field. This caused a disconnect between what was displayed and what was actually stored in the parent component's state.

## Solution
Restored the Input-based implementation from the previously accepted version with these key features:

1. **Direct Input Field**: Uses an `<Input>` component as the trigger, allowing direct typing and display
2. **Synchronized State**: The `inputValue` state stays in sync with the parent's `value` prop
3. **Proper onChange Calls**: 
   - When typing: Updates parent state with each keystroke
   - When selecting: Updates parent state with the selected option's value
   - Custom values: Allows pressing Enter to add non-listed items

## Key Changes
- Removed Button-based trigger 
- Restored Input field that directly displays and allows editing
- Fixed state synchronization between component and parent
- Maintained autocomplete dropdown functionality

## Result
Users can now:
- Type to search medications/supplements
- Click to select from dropdown
- See their selection immediately in the input field
- Have the dosage auto-populate when available
- Add custom entries by typing and pressing Enter
