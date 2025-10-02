# Question Pack Import Guide

## Overview
This guide explains how to import the 54 manual "Perfect Question DNA" sets into the question packs system.

## Step 1: Access Admin Panel
Navigate to `/admin/questions` in your browser.

## Step 2: Prepare Question Pack JSON
Each question pack should follow this structure:

```json
{
  "slug": "category-subcategory-microservice",
  "source": "manual",
  "status": "approved",
  "content": {
    "id": "unique-id",
    "category": "Category Name",
    "name": "Microservice Name",
    "slug": "category-subcategory-microservice",
    "i18nPrefix": "category.microservice",
    "questions": [
      {
        "key": "q1",
        "type": "single|multi|yesno|text|number|scale",
        "i18nKey": "category.microservice.q1.title",
        "required": true,
        "options": [
          {
            "i18nKey": "category.microservice.q1.options.option1",
            "value": "option1",
            "order": 0
          }
        ],
        "aiHint": "Question text for display"
      }
    ]
  }
}
```

## Step 3: Bulk Import
1. Go to the "Import" tab in the Admin Questions page
2. Click "Choose Files" or drag and drop your JSON files
3. The system will:
   - Validate each file against the schema
   - Auto-increment version numbers
   - Mark as `source: 'manual'` and `status: 'approved'`
   - Automatically activate the packs (`is_active: true`)

## Step 4: Verify Import
1. Switch to the "Browse Packs" tab
2. Filter by `status: approved` and `source: manual`
3. Verify all 54 question sets are present
4. Check that they're marked as active

## Question Type Reference

### Question Types
- **single**: Single choice (radio buttons)
- **multi**: Multiple choice (checkboxes)
- **yesno**: Boolean yes/no
- **text**: Free text input
- **number**: Numeric input
- **scale**: Slider/range input

### Required Fields
- `key`: Unique identifier within the pack (e.g., "q1", "q2")
- `type`: One of the question types above
- `i18nKey`: Internationalization key for the question text
- `required`: Boolean indicating if answer is mandatory
- `aiHint`: Human-readable question text (used for display and AI context)

### Optional Fields
- `options`: Array of options for single/multi type questions
- `visibility`: Conditional display rules based on previous answers

## Sample JSON
See `sample-question-packs.json` for three complete examples:
1. Electrician - Full House Rewire
2. Plumber - Bathroom Installation
3. Builder - Room Addition

## Priority Microservices for Manual Question Sets

### Top 18 Categories (54 High-Value Microservices)

1. **Builder** (3 services)
   - Garage Conversion
   - Loft Conversion
   - Stone Wall Restoration

2. **Plumber** (3 services)
   - Bathroom Installation ✅ (sample provided)
   - Leak Repairs
   - Drain Unblocking

3. **Electrician** (3 services)
   - Full Rewire ✅ (sample provided)
   - Lighting Installation
   - Fault Finding

4. **Carpenter** (3 services)
   - Custom Furniture
   - Door Installation
   - Pergola Build

5. **Painter & Decorator** (3 services)
   - Interior Painting
   - Exterior Painting
   - Wallpaper/Decorative

6. **Plasterer/Renderer** (3 services)
   - Wall/Ceiling Skimming
   - Exterior Rendering
   - Decorative Plaster

7. **Roofer** (3 services)
   - Roof Repairs
   - Full Re-Roof
   - Guttering & Drainage

8. **Tiler** (3 services)
   - Floor Tiling
   - Wall Tiling
   - Outdoor/Pool Tiling

9. **Landscaper** (3 services)
   - Turfing/Lawn
   - Decking/Patio Build
   - Irrigation Systems

10. **Bricklayer/Mason** (3 services)
    - Boundary Walls
    - BBQ/Outdoor Kitchen
    - Decorative Stonework

11. **Glazier/Glass** (3 services)
    - Window/Door Glass
    - Glass Balustrades
    - Shower Screens

12. **Flooring Specialist** (3 services)
    - Wooden Flooring
    - Laminate/Vinyl
    - Sanding & Restoration

13. **Kitchen Specialist** (3 services)
    - Full Kitchen Install
    - Worktop Replacement
    - Kitchen Refurbishment

14. **Bathroom Specialist** (3 services)
    - Full Bathroom Install
    - Shower Upgrade
    - Vanity Installation

15. **Heating & Cooling** (3 services)
    - Air Conditioning
    - Underfloor Heating
    - Boiler/Hot Water

16. **Hard Landscaping** (3 services)
    - Driveways
    - Garden Pathways
    - Patio/Terrace Stonework

17. **Demolition/Clearance** (3 services)
    - Interior Demolition
    - Exterior Demolition
    - Site Clearance

18. **General Handyman** (3 services)
    - General Repairs
    - Furniture Assembly
    - Mounting & Fixtures

## Missing Ibiza-Specific Microservices

These high-value Ibiza services are currently missing from the database:

1. **Microcement Installation** (under Flooring/Specialist Finishes)
   - Modern flooring technique popular in Ibiza
   - Used for bathrooms, kitchens, outdoor areas
   - Requires specialist knowledge

2. **Stone Wall Restoration** (under Builder/Masonry)
   - Traditional Ibiza dry stone walls (marès)
   - Heritage property work
   - Critical for rural properties

3. **Glass Balustrades/Railings** (under Glazier)
   - Modern villa requirement
   - Pool safety compliance
   - Sea view optimization

4. **Outdoor BBQ/Kitchen Build** (under Bricklayer/Mason)
   - Essential for Ibiza lifestyle
   - Stone/brick construction
   - Gas and electrical integration

5. **Pool Equipment Installation** (new subcategory under Plumber)
   - Pumps, filters, heaters
   - Salt chlorination systems
   - Solar pool heating

## Next Steps After Import

1. **Verify Question Display**
   - Test question rendering in the wizard
   - Check conditional logic works correctly
   - Validate translations (i18n keys)

2. **Monitor Analytics**
   - Track completion rates per pack
   - Identify drop-off points
   - Measure time to complete

3. **Iterative Improvement**
   - Review low-performing packs
   - A/B test question variations
   - Refine based on user feedback

4. **AI Generation for Remaining Services**
   - Let AI generate questions for the other 87 microservices
   - Admin reviews and approves AI-generated packs
   - Promote approved AI packs to manual status if they're high quality
