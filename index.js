import GmailClient from './g-client.js';

// Updates events in the calendar by moving expired events to the next future day
async function reschedulePastEvents() {
    const gmailClient = new GmailClient();
    await gmailClient.initialize();
  
    try {
        const pastEvents = await gmailClient.listPastEvents();
        const now = new Date();
    
        for (const event of pastEvents) {
            // Extract event details
            const { id, summary, location, description, start, end, attendees, reminders } = event;
            
            // Handle both dateTime and all-day date fields
            const startDate = start.dateTime || start.date;
            const endDate = end.dateTime || end.date;
    
            // Ensure the start and end dates are valid
            if (!startDate || !endDate || isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
                console.error(`Invalid event times for event: ${summary}`, event);
                continue;
            }

            // Delete the past event
            await gmailClient.deleteEvent(id);
            console.log(`Deleted past event: ${summary}`);
    
            // Calculate new start and end dates (1 day from now for simplicity)
            const newStartDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const newEndDate = new Date(newStartDate.getTime() + (new Date(endDate).getTime() - new Date(startDate).getTime()));
    
            // Create a new event with the same details but future dates
            const createdEvent = await gmailClient.createEvent(
                summary,
                location,
                description,
                newStartDate.toISOString(),
                newEndDate.toISOString(),
                start.timeZone || 'America/Los_Angeles',
                event.recurrence,
                attendees,
                reminders
            );
    
            console.log(`Created future event: ${createdEvent.summary}`);
        }
    } catch (error) {
        console.error('Error rescheduling past events:', error);
    }
}

// Run the reschedule function
reschedulePastEvents();
