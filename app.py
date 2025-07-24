from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Render the main SafeWalk page
@app.route('/')
def index():
    return render_template('index.html')

# Endpoint to receive location data
@app.route('/send_location', methods=['POST'])
def receive_location():
    data = request.get_json()
    print(f"Received location: {data}")
    return jsonify({'status': 'received'})

@app.route('/sos_alert', methods=['POST'])
def sos_alert():
    data = request.get_json()
    print("🚨 SOS Alert Received:", data)

    # Optional: Send email or SMS (via SMTP or Twilio)
    # For now just simulate
    # send_sms(data['maps_url'])  # TODO: Add this with Twilio later

    return jsonify({"status": "Emergency contact notified!"})
# Endpoint to handle SOS alerts

if __name__ == '__main__':
    app.run(debug=True)
