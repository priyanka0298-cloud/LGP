-- Enable realtime for the tasks table so client subscriptions receive live updates
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
