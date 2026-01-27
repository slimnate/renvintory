# Renvintory User Guide

## Introduction

Renvintory is an inventory tracking application designed to simplify inventory management for locations at the Kansas City Renaissance Festival. This guide will help you understand how to use the application to track your opening and closing inventory, log spills and product intake, and generate the reports needed for your closing paperwork.

The application is organized around four main concepts:
- **Locations** - Different venues or bars where inventory is tracked
- **Items** - Products that are sold (beers, drinks, etc.)
- **Inventories** - Counts taken at different times (opening, closing, spills, intake)
- **Reports** - Summaries of inventory data for paperwork

## Getting Started

When you first open Renvintory, you'll see the home page which displays all available locations and a list of all items in the system.

![Home page showing locations and items](/assets/guide/01-home-locations.png)

From the home page, you can:
- Click on any location name to view that location's inventory and available items
- Click "Manage items" to add, edit, or remove items from the system

## Locations

### Viewing a Location

Click on any location name from the home page to view that location's details. The location page shows two main sections:

1. **Inventories** - All inventory counts organized by date
2. **Available Items** - Items that are available at this location

![Location page showing inventories and available items](/assets/guide/02-location-page.png)

### Creating a New Inventory

To create a new inventory for a specific date:

1. Navigate to the location page
2. Click the "New inventory" button in the Inventories section
3. This creates a set of four inventory types for today's date:
   - **Open** - For opening counts
   - **Close** - For closing counts
   - **Spill** - For tracking spilled items
   - **Intake** - For tracking product received during the shift

### Managing Inventories by Date

Each date shows a row with buttons for each inventory type. You can:
- Click **Open** or **Close** to count items for opening or closing inventory
- Click **Spill** or **Intake** to count items for those inventory types (these use the same counting interface)
- Click **Opening Report** or **Closing Report** to view reports (only available after counts are entered)
- Click **Details** to see a detailed view of all inventories for that date, including spill and intake data
- Click **Delete** to remove all inventories for that date (use with caution)

### Managing Items at a Location

To add or remove items available at a location:

1. Click the "Manage items" button in the Available Items section
2. Click the "Add item" card that appears
3. Select an item from the dropdown menu
4. Click "Add" to add it to the location

To remove an item:
1. Click "Manage items" to enter edit mode
2. Click the red "X" button on any item card
3. Confirm the removal

## Counting Items

The counting interface is designed to make inventory counting quick and intuitive. Each item can be counted by container size (e.g., individual cans, 4-packs, 6-packs, 12-packs, 24-packs).

### Opening Inventory Count

To count your opening inventory:

1. Navigate to your location page
2. Find the date row for today
3. Click the **Open** button
4. You'll see a grid of all items available at this location

![Opening inventory count page](/assets/guide/03-count-open.png)

For each item:
- The **Total** badge shows the total number of individual units (calculated automatically)
- Each container size has its own row with:
  - A **-** button to decrease the count
  - The current count and container size (e.g., "4 x 24 cans")
  - A **+** button to increase the count

**Counting Tips:**
- Count in the most natural way for you - if you see 3 cases of 24-packs, click the + button three times for the 24-pack row
- The total updates automatically as you count
- You can mix container sizes - for example, count 2 x 24-packs and 5 individual cans separately
- This method makes it easy to verify your counts visually

### Closing Inventory Count

The closing count works exactly like the opening count:

1. At the end of your shift, navigate to your location page
2. Click the **Close** button for today's date
3. Count all remaining items using the same interface
4. The system will use these counts to calculate sales in the closing report

### Logging Spills

Throughout your shift, you should log any items that are spilled or wasted:

1. Navigate to your location page
2. Click the **Spill** button for today's date
3. Count only the items that were spilled or wasted using the same counting interface as opening/closing
4. These counts are used in the closing report to calculate spilled value
5. To view spill data later, click **Details** on the location page for that date

### Recording Intake

If you receive new product during your shift:

1. Navigate to your location page
2. Click the **Intake** button for today's date
3. Count only the items that were received using the same counting interface as opening/closing
4. These counts are added to your opening inventory for sales calculations
5. To view intake data later, click **Details** on the location page for that date

## Item Management

The Items page allows you to manage all items in the system and their container sizes.

![Items management page](/assets/guide/04-items.png)

### Adding a New Item

1. Navigate to the Items page (click "Manage items" from the home page)
2. In the "Add New Item" section, enter:
   - **Item name** - The name of the product
   - **Price** - The selling price per unit
3. Select container sizes that this item comes in by checking the boxes
4. If you need a container size that doesn't exist, use the "Quick Add" section below to create it first
5. Click "Add Item"

### Creating Container Sizes

Before adding an item, you may need to create container sizes:

1. In the "Add New Item" section, select the container type (Can, Bottle, or Cup)
2. Enter the size (number of units) in the "Quick Add" field
3. Click "Quick Add" to create the container
4. The new container will automatically be selected for your item

### Editing an Item

1. Find the item in the "All Items" list
2. Click the "Edit" button
3. Modify the name, price, or container selections
4. Click "Save" when done

### Deleting an Item

1. Find the item in the "All Items" list
2. Click the "Delete" button
3. Confirm the deletion

**Note:** Be careful when deleting items, as this will remove them from all locations and may affect historical inventory data.

## Reports

Reports provide summaries of your inventory data. There are two types of reports available: Opening Report and Closing Report.

### Opening Report

The opening report shows a simple list of all items and their opening counts, broken down by container size.

![Opening report](/assets/guide/05-report-opening.png)

To view:
1. Navigate to your location page
2. Find the date row
3. Click "Opening Report"

The report shows:
- Item name
- Price per unit
- Count breakdown by container size
- Total count

### Viewing Spill and Intake Data

While there are no separate reports for spill and intake, you can view this data through the Details page:

1. Navigate to your location page
2. Find the date row
3. Click **Details**
4. This page shows all four inventory types (Open, Close, Spill, Intake) with their counts

The Details page displays spill and intake data in the same format as the opening report, showing item names, prices, container breakdowns, and totals.

### Closing Report

The closing report is the most comprehensive report and combines data from all four inventory types to provide the information needed for closing paperwork.

![Closing report](/assets/guide/06-report-closing.png)

To view:
1. Navigate to your location page
2. Find the date row
3. Click "Closing Report"

The closing report shows a table with the following columns:

- **Item** - Product name
- **Price** - Selling price per unit
- **Open** - Opening count
- **Close** - Closing count
- **Spill** - Spilled count
- **Intake** - Received count
- **Open + Intake** - Total available inventory (opening + received)
- **Total Used** - Total items used (opening + intake - closing)
- **Spilled Value** - Dollar value of spilled items
- **Sales** - Dollar value of items sold (total used - spilled value)

At the bottom of the report, you'll find:
- **Total sales for the location for that day** - Sum of all sales
- **Total spillage for that day** - Sum of all spilled value

Use this report to fill out your closing paperwork.

### Daily Workflow Summary

A typical shift workflow:

1. **Start of shift:**
   - Create new inventory (if needed)
   - Count opening inventory
   - Review opening report if needed

2. **During shift:**
   - Log spills as they happen (click Spill button to count)
   - Record intake when product is received (click Intake button to count)
   - View Details page to verify spill and intake data if needed

3. **End of shift:**
   - Count closing inventory
   - View closing report
   - Complete closing paperwork using report data

## Tips and Best Practices

- **Count consistently** - Always count in the same way to avoid confusion
- **Log spills immediately** - Don't wait until the end of shift to log spills
- **Verify totals** - The total count badge helps you quickly verify your math
- **Use container sizes** - Counting by container size (24-packs, 6-packs, etc.) is faster and more accurate than counting individual units
- **Check reports before closing** - Review your closing report to ensure all numbers make sense before completing paperwork
- **Double-check important counts** - For high-value items, consider counting twice

## Troubleshooting

**I can't find today's inventory:**
- Make sure you've clicked "New inventory" to create it
- Check that you're looking at the correct location

**My counts aren't saving:**
- Make sure you're clicking the + or - buttons (not just viewing)
- Wait a moment after clicking - the page updates automatically
- Refresh the page if counts seem stuck

**The closing report shows incorrect numbers:**
- Verify that you've completed all four inventory types (Open, Close, Spill, Intake)
- Check that your opening and closing counts are accurate
- Make sure spills and intake are logged correctly

**I need to delete an inventory:**
- Use the Delete button on the location page for the specific date
- This will delete all inventory types for that date
- Be careful - this action cannot be undone

## Getting Help

If you encounter issues or have questions about using Renvintory:
- Check this guide first
- Review the reports to verify your data
- Contact your manager or system administrator for assistance

---

*Last updated: January 2026*
