# Team-Shockwave-in-MIE-Robolution
This repository is for the MIE Robolution competition held on CUET. Team Shockwave documented the necessary required solutions and answers in this.
<br>
# A) Quick Fixes 
<br>

Q1) <b>Suggested features:</b>

*Must balance pace, accuracy, and be user-friendly.*

1. <b>Intuitive Menu Navigation:</b> Easy scrolling and selection using buttons for all users.
2. <b>Real-Time Order Updates:</b> Instant transmission to the kitchen via cloud.
3. <b>Order Confirmation:</b> Display confirmation on the device after order submission.

<img src="circuit_Res_management.png" width="1000" />

Q2) <b>Design principles:</b>


*Design must be user-friendly. Too much complex UI can lead to backlash from general consumers.*

1. <b>Button principle:</b> Minimal button presses (e.g., one button to open the menu, two to confirm) and Maintain the same level of consistency for similar actions, like using the same button for the same task.Example – Back always on Button 1.
2. <b>Display principle:</b> Visual cues on the OLED display (e.g., highlight selected item, show quantity). Giving feedback while task like add to cart or confirm order is completed.

Q3) <b> Potential security vulnerabilities</b> 

*Hackers or young customers might tamper or try exploiting the weak spots.*

1. <b>Theft of Device:</b> Secure devices to tables; use tamper-proof screws.
2. <b>Order Tampering:</b> Encrypt data transmission; use unique order IDs.
3. <b>Data Leaks:</b> Maintain a secure protocol like HTTPS for data transfer in the cloud.

Q4) <b>Strategies:</b>

*System lag can frustrate customers.* 

1. <b>Load Balancing:</b> Distribute cloud requests across 2 or more servers.
2. <b>Queue Management:</b> Buffer orders in a queue to prevent system overload.

Q5)  <b>Integrate the existing inventory system</b>

*Sudden system changes can create chaos in the kitchen.*

🔗 **Gradual Sync:**  
 API can be used to fetch and update stock data seamlessly. The API fetches inventory data by sending a GET request to the inventory management system's endpoint (e.g., /api/inventory), retrieving real-time stock levels for ingredients like tomatoes or pasta, which are then stored in a cloud database like Firebase. To update stock without interrupting kitchen operations, the API uses asynchronous POST requests (e.g., /api/inventory/update) triggered by each order, deducting used quantities (e.g., 2 tomatoes for a salad) from the database while the kitchen continues its workflow uninterrupted. This method ensures smooth operations, as the kitchen focuses on cooking while the system handles stock adjustments automatically.
```
 [Smart Pad Order] → [API: GET /inventory] → [Cloud DB: Fetch Stock]
                          ↓
[Order Processed] → [API: POST /update] → [Cloud DB: Update Stock]
                          ↓
[Kitchen Dashboard: View Updated Stock]
```


# B) 


# C)

# D) Big Idea: Order Delivery Time Prediction on OLED Display

<b>Problem</b>
<hr>
Customers at Bistro 92 often face uncertainty about how long their orders will take to arrive, leading to frustration, especially during peak hours. Without real-time insights into kitchen workload, ingredient availability, or staff capacity, customers may perceive delays as poor service, impacting their dining experience and satisfaction.

<b>Solution</b>
<hr>
We propose integrating an Order Delivery Time Prediction System into the smart ordering device, displaying an estimated delivery time on the OLED screen after an order is placed. The system calculates the estimated time by analyzing multiple factors: ingredient availability, stove and cooker availability, waiter availability, and historical order fulfillment data. Additionally, it accounts for real-time kitchen workload and order complexity (e.g., preparation time for sushi vs. pasta) to provide accurate predictions. Once the order is submitted via the ESP32 module, the OLED display updates with a message like “Estimated Delivery: 12 minutes,” enhancing transparency and managing customer expectations effectively.

<b>Technology Stack</b>
<hr>

<b>Backend:</b> Python with Flask for the prediction API, hosted on AWS Lambda for scalability.


<b>Machine Learning:</b> Scikit-learn for a regression model to predict delivery time based on historical data.

<b>Database:</b> PostgreSQL to store inventory, kitchen resources, staff schedules, and historical order data.


<b>Frontend:</b> OLED display on the smart pad to show the predicted time.

<b>IoT Integration:</b> ESP32 to fetch and display the prediction after order submission.

<b>Implementation</b>
<hr>
<b>Data Collection:</b> Gather real-time data on ingredient stock (via the inventory API), kitchen resources (e.g., number of stoves/cookers available, tracked by a kitchen management system), and waiter availability (via a staff scheduling system). Historical data on order fulfillment times (e.g., sushi takes 8 minutes on average) is stored in PostgreSQL.

</b>Prediction Model:</b> Train a regression model using scikit-learn, with features like order complexity (e.g., number of items, preparation difficulty), ingredient availability (e.g., low stock may delay sourcing), kitchen workload (e.g., 5 pending orders), and waiter availability (e.g., 2 waiters on shift). Additional factors like peak hours (detected via time-based analysis) and historical averages (e.g., pasta orders take 10 minutes during lunch rush) are included to improve accuracy.

<b>Real-Time Calculation:</b> When an order is placed, the ESP32 sends the order details to the Flask API, which queries the database for current kitchen status and runs the prediction model. The API returns the estimated time (e.g., 12 minutes) to the ESP32.


<b>Display on OLED:</b> The smart pad updates the OLED display with the predicted time, formatted as “Estimated Delivery: 12 minutes,” and refreshes if kitchen conditions change (e.g., a stove becomes available, reducing the estimate to 10 minutes).

<b>Continuous Improvement:</b> Incorporate customer feedback (e.g., “Was the estimated time accurate?” via a post-order prompt on the smart pad) and actual delivery times to retrain the model periodically, ensuring predictions remain accurate over time.

<b>Additional Considerations</b>
<hr>

<b>Order Complexity Factor:</b> Account for preparation differences (e.g., grilling takes longer than assembling a salad) by assigning weights to menu items in the model.

<b>Dynamic Updates:<b/> If a stove breaks down or a waiter calls in sick, the system adjusts the prediction in real-time and notifies the customer via the OLED display.

<b>Customer Communication:<b/> 
Display a confidence level (e.g., “90% confidence”) alongside the estimate to set realistic expectations, especially during unpredictable scenarios like sudden rushes.

<b>Benefits:</b> 
<hr>
<b>Improved Customer Experience:</b>
Transparency about delivery times reduces anxiety and builds trust, enhancing satisfaction.Better Kitchen Management: Insights into workload factors help staff prioritize tasks (e.g., freeing up a stove for high-priority orders).Data-Driven Optimization: Historical data analysis identifies bottlenecks (e.g., frequent delays due to limited stoves), informing operational improvements.Increased Efficiency: Accurate predictions prevent overpromising, reducing customer complaints and staff stress during peak hours.

<b>Diagram</b>

```
[Customer Places Order] → [ESP32: Send Order Data] → [Flask API: Fetch Kitchen Data]
                           ↓                               ↓
[PostgreSQL: Ingredient, Stove, Waiter Data] ← [ML Model: Predict Time (12 min)]
                           ↓                               ↓
[ESP32: Receive Prediction] → [OLED Display: "Estimated Delivery: 12 minutes"]
```
