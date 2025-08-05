/* globals zoomSdk */
import { React, useState, useEffect } from 'react';
import "./Engagement.css"

function Engagement({ configureSdk }) {
  const [engagementId, setEngagementId] = useState("")
  const [engagementStatus, setEngagementStatus] = useState("")
  const [engagementContext, setEngagementContext] = useState("")

  const [formData, setFormData] = useState(() => {
    const savedData = JSON.parse(localStorage.getItem(engagementId)) || {};
    return {
      text: savedData.text || "",
      date: savedData.date || "",
      contactMethod: savedData.contactMethod || "",
      interests: savedData.interests || [],
      range: savedData.range || 50,
    }
  })

  const updateLocalStorage = (updatedData) => {
    const currentData = JSON.parse(localStorage.getItem(engagementId)) || {}
    const newData = { ...currentData, ...updatedData }
    localStorage.setItem(engagementId, JSON.stringify(newData))
  }

  const handleChange = (field, value) => {
    const updatedData = { ...formData, [field]: value }
    setFormData(updatedData)
    updateLocalStorage({ [field]: value })
  }

  const handleCheckboxChange = (value) => {
    const updatedInterests = formData.interests.includes(value)
      ? formData.interests.filter((interest) => interest !== value)
      : [...formData.interests, value]
    handleChange("interests", updatedInterests)
  }

  useEffect(() => {
    if (engagementId) {
      const savedData = JSON.parse(localStorage.getItem(engagementId)) || {}
      setFormData({
        text: savedData.text || "",
        date: savedData.date || "",
        contactMethod: savedData.contactMethod || "",
        interests: savedData.interests || [],
        range: savedData.range || 50,
      })
    }
  }, [engagementId])

  useEffect(async () => {
    try {
      await configureSdk()
      const engagementContext = await zoomSdk.callZoomApi('getEngagementContext')
      const engagementStatus = await zoomSdk.callZoomApi('getEngagementStatus')
      setEngagementId(engagementContext.engagementContext.engagementId)
      setEngagementContext(engagementContext.engagementContext.queueName)
      setEngagementStatus(engagementStatus.engagementStatus.state)
    } catch (error) {
      console.error('Error getting engagement: ', error)
    }
  }, [configureSdk])

  useEffect(() => {
    const handleEngagementContextChange = async (event) => {
      try {
        setEngagementId(event.engagementContext.engagementId)
        setEngagementContext(event.engagementContext.queueName)
      } catch (error) {
        console.error('Error handling engagement context change:', error)
      }
    }

    const handleEngagementStatusChange = async (event) => {
      try {
        setEngagementStatus(event.engagementStatus.state)
        if (event.engagementStatus.state === "end" && engagementId) {
          localStorage.removeItem(engagementId);
          setFormData({
            text: "",
            date: "",
            contactMethod: "",
            interests: [],
            range: 50,
          });
        }
      } catch (error) {
        console.error('Error handling engagement status change: ', error)
      }
    }
    zoomSdk.addEventListener('onEngagementStatusChange', handleEngagementStatusChange)
    zoomSdk.addEventListener('onEngagementContextChange', handleEngagementContextChange)

    return () => {
      zoomSdk.removeEventListener('onEngagementStatusChange', handleEngagementStatusChange)
      zoomSdk.removeEventListener('onEngagementContextChange', handleEngagementContextChange)
    }
  }, [engagementId])

  return (
    <div>
      <h1>ZCC Engagement Notes</h1>
      <span><strong>Engagement Id:</strong> {engagementId}</span>
      <br />
      <span><strong>Engagement Status:</strong> {engagementStatus}</span>
      <br />
      <span><strong>Engagement Context:</strong> {engagementContext}</span>
      <br />
      <br />

      <div className="input-types">
        <label><strong>Text</strong></label>
        <textarea
          value={formData.text}
          onChange={(e) => handleChange("text", e.target.value)}
          style={{ height: "200px" }}
        />

        <label><strong>Choose a Date:</strong></label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange("date", e.target.value)}
        />

        <label><strong>Preferred Contact Method:</strong></label>
        <div className="input-pair">
          <input
            type="radio"
            id="email"
            name="contact"
            value="email"
            checked={formData.contactMethod === "email"}
            onChange={(e) => handleChange("contactMethod", e.target.value)}
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="input-pair">
          <input
            type="radio"
            id="phone"
            name="contact"
            value="phone"
            checked={formData.contactMethod === "phone"}
            onChange={(e) => handleChange("contactMethod", e.target.value)}
          />
          <label htmlFor="phone">Phone</label>
        </div>

        <label><strong>Interests:</strong></label>
        <div className="input-pair">
          <input
            type="checkbox"
            id="coding"
            name="interest"
            value="coding"
            checked={formData.interests.includes("coding")}
            onChange={(e) => handleCheckboxChange("coding")}
          />
          <label htmlFor="coding">Coding</label>
        </div>
        <div className="input-pair">
          <input
            type="checkbox"
            id="music"
            name="interest"
            value="music"
            checked={formData.interests.includes("music")}
            onChange={(e) => handleCheckboxChange("music")}
          />
          <label htmlFor="music">Music</label>
        </div>
        <div className="input-pair">
          <input
            type="checkbox"
            id="sports"
            name="interest"
            value="sports"
            checked={formData.interests.includes("sports")}
            onChange={(e) => handleCheckboxChange("sports")}
          />
          <label htmlFor="sports">Sports</label>
        </div>

        <label><strong>Set a Range:</strong></label>
        <input
          type="range"
          min="1"
          max="100"
          value={formData.range}
          onChange={(e) => handleChange("range", e.target.value)}
        />
      </div>
    </div>
  )
}

export default Engagement
