Replace the starter content in this vue project with a time organizing app. Here’s what I want:

-a toolbar with the name “DayVue” as the logo on the left side with a sun icon as the logomark
-the right side of the toolbar should include icon buttons that open drawers for: Notifications and Settings. 
-3 pill-shaped tabs to toggle between the following 3 page-views: Schedule, Tasks, Habits
-A CTA to add a new item that opens a modal allowing users to add a new schedule item, task, or habit.
-Make the Schedule page the home route.
-Scheduler page will have a daily calendar view from 12am to 12pm, with half hour increments and time labels for hourly increments. 
-Smooth hover animations on the buttons and the toggle tabs.
-Dark mode by default with a light/dark toggle button in the Settings drawer.
-Use Google font Hammersmith One as the logo and button font.
-Use Google font Livvic for all other type. 

## What is this?
A mobile-friendly web app used for scheduling, task management, and habit tracking for a person with ADHD, who wants to manage their time. The app includes a homepage dashboard view that summarizes key data elements and patterns from each of those three pages so the user can track progress and see where they need to improve or adjust.

## Data
Generate a fake dataset as a JSON file (src/data/metrics.json). 
5 months of data (March 2026-July 2026), each month containing:
-a list of 20-30 generic household and work related tasks and chores, with 2-3 tasks that repeat daily.
-a fake schedule of events for weekday work hours along with some extracurricular activities on some evenings and on the weekends. some events should repeat daily, like work meetings, and some can be one-offs.
-fake data tracking 4 daily habits across the 5 months:
    1. gym 
    2. meditation 
    3. bed time before 11pm 
    4. sketch for 5 mins 


## Layout (Vuetify)
-Mobile-friendly, desktop and tablet view uses left nav sidebar with stacked links while the mobile view shifts to the toggle switch tabs.
-Progress dashboard with summary cards of user entered entered data.
  
-Navigation should show 4 pages:
    -Schedule - with a calendar icon
    -Tasks - with a checklist icon
    -Habits - with a repeat icon
    -Recap - a historical, filterable view of user's progress based on their entries for the other three pages
    
-In the mobile view, the navigation will be a bottom nav with a toggle switch with 3 pill-shaped tabs to toggle between the 4 pages. On the right of the toggle switch will be an icon button with a plus icon to allow users to add a new item. 
  
-The add item button and icon button will open a modal that allowing users to add a new event, task, or habit based on the page they’re on. 

-Schedule page will have a daily calendar view of 24 hours starting at 12 am and time labels for hourly increments. Include an option to switch from day, week, and month views. 
    -Adding an item on the schedule will open a modal that allows users to enter the following inputs:
        -Event title/name
        -duration with options to quick select preset durations in the following increments: 1, 5, 10, 15, 20, 30, 45, 1h, 1.5h, 2h or add a custom duration from a dropdown.
        -icon (this will display in a circle on the left side of the event block on the calendar)
        -color (for the event block on the calendar)

-Tasks page: tasks will display in a stacked list of cards with a circle on the far left that when clicked will mark the task as done. completed task pills will have a desaturated color and a strikethrough on the task title. 
    -Adding an item modal inputs:
        -Task name
        -Priority (low, medium, high)
        -Progress (not started, in progress, done)
    -Entered tasks should be editable to update the name, priority, and progress, or to delete them altogether. 
    -Tasks page should include a sort by dropdown to allow sorting by priority or by progress. colored chips will display on the cards for priority and progress levels. tapping on the chips will allow the user to edit the levels.



## Style
-Use Google font Outfit Medium 500 as the logo and button font
-Use Google font Syne Regular 400 for all other type. 
-Dark mode by default with a light/dark toggle button in the Settings drawer.
-Use a color palette with a very dark teal, a very pale yellow for navigation buttons and tabs, and a bright peach for call to action buttons. Ensure that dark and light mode palettes work inversely and maintain accessibilty standards for color contrast.
-Mobile-responsive, with cards stacking on top of each other in the dashboard view. 
-Any charts or highlighted data elements should use a cohesive color palette that works with the color palette established above.