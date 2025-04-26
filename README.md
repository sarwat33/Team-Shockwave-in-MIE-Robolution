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

<img src="circuit_Res_management.png" width="300" />
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

# D) Big Idea 

