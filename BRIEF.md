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
-Homepage dashboard with summary cards for the following pages:
    -Schedule 
        -the day's schedule at a glance with a snapshot of current or upcoming events, maximum of 3 events.
        -number of events for the day
    -Tasks
        -number of tasks for the day, highlighting how many were completed, how many are in progress, and how many have not been started
    -Habits
        -highlight active habits, displaying progress on them and bringing attention to any habits that have maintained a streak of more than 5 consecutive entries.

## Style
-Use Google font Outfit Medium 500 as the logo and button font
-Use Google font Syne Regular 400 for all other type. 