# Troubleshooting & FAQ

## FAQ

**Q: How do I add a new Smart Meter?**
A: Navigate to the Admin Dashboard -> Hardware -> Add Meter. You must provide the unique Serial Number printed on the physical device. The meter will auto-provision once it connects to the MQTT broker.

**Q: Why is my dashboard not updating in real-time?**
A: Ensure that Socket.IO is connected (indicated by the green status indicator in the navbar). If it's disconnected, check your network connection or contact your administrator, as the WebSocket server might be restarting.

## Troubleshooting

### Issue: "Invalid Credentials" after password reset
- **Cause**: The password reset token might have expired or was already used.
- **Resolution**: Request a new password reset link from the login page.

### Issue: MQTT Data not appearing in the Database
- **Cause**: The Node.js server might have lost connection to the Mosquitto broker, or the device is publishing to the wrong topic.
- **Resolution**: 
  1. Check Docker logs: `docker compose logs -f server mqtt`
  2. Verify the device is publishing to `meters/<SERIAL_NUMBER>/reading`.

### Issue: AI Predictions are failing
- **Cause**: The AI container might be out of memory or unreachable.
- **Resolution**: Ensure the FastAPI container is running (`docker ps`). Check if the Node.js server has the correct `AI_SERVICE_URL` environment variable configured in `docker-compose.yml`.
