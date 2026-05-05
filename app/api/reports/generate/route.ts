import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Calculate readiness score
    let readinessScore = 0
    const avgSkillLevel = data.skills.length > 0
      ? data.skills.reduce((acc: number, s: { skill_level: number }) => acc + s.skill_level, 0) / data.skills.length
      : 0
    readinessScore += (avgSkillLevel / 100) * 30
    readinessScore += (data.cvScore / 100) * 20
    const avgInterviewScore = data.interviews.length > 0
      ? data.interviews.reduce((acc: number, i: { overall_score: number }) => acc + i.overall_score, 0) / data.interviews.length
      : 0
    readinessScore += (avgInterviewScore / 100) * 20
    readinessScore += Math.min(data.projects.length * 3, 15)
    readinessScore += Math.min(data.progress.level * 1.5, 15)
    readinessScore = Math.round(readinessScore)

    const getReadinessLabel = (score: number) => {
      if (score >= 80) return "Job Ready"
      if (score >= 60) return "Almost Ready"
      if (score >= 40) return "Making Progress"
      return "Just Starting"
    }

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6; }
    .header h1 { font-size: 28px; color: #3b82f6; margin-bottom: 8px; }
    .header p { color: #666; }
    .score-section { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .score-section .score { font-size: 64px; font-weight: bold; }
    .score-section .label { font-size: 20px; margin-top: 8px; }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 18px; color: #3b82f6; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .stat-card { background: #f8fafc; padding: 16px; border-radius: 8px; }
    .stat-card .label { font-size: 12px; color: #666; text-transform: uppercase; }
    .stat-card .value { font-size: 24px; font-weight: bold; color: #1a1a1a; }
    .skill-list { display: flex; flex-wrap: wrap; gap: 8px; }
    .skill-badge { background: #e0e7ff; color: #3730a3; padding: 6px 12px; border-radius: 20px; font-size: 13px; }
    .project-item { background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
    .recommendations { background: #fef3c7; padding: 20px; border-radius: 8px; }
    .recommendations h3 { color: #92400e; margin-bottom: 12px; }
    .recommendations ul { margin-left: 20px; color: #78350f; }
    .recommendations li { margin-bottom: 8px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Career Readiness Report</h1>
      <p>${data.profile.full_name || "Anonymous"} | ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="score-section">
      <div class="score">${readinessScore}/100</div>
      <div class="label">${getReadinessLabel(readinessScore)}</div>
    </div>

    <div class="section">
      <h2>Profile Summary</h2>
      <div class="grid">
        <div class="stat-card">
          <div class="label">Name</div>
          <div class="value" style="font-size: 16px;">${data.profile.full_name || "Not set"}</div>
        </div>
        <div class="stat-card">
          <div class="label">Headline</div>
          <div class="value" style="font-size: 16px;">${data.profile.headline || "Not set"}</div>
        </div>
        <div class="stat-card">
          <div class="label">Location</div>
          <div class="value" style="font-size: 16px;">${data.profile.location || "Not set"}</div>
        </div>
        <div class="stat-card">
          <div class="label">Level</div>
          <div class="value">${data.progress.level}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Performance Metrics</h2>
      <div class="grid">
        <div class="stat-card">
          <div class="label">Skills Added</div>
          <div class="value">${data.skills.length}</div>
        </div>
        <div class="stat-card">
          <div class="label">CV ATS Score</div>
          <div class="value">${data.cvScore}%</div>
        </div>
        <div class="stat-card">
          <div class="label">Mock Interviews</div>
          <div class="value">${data.interviews.length}</div>
        </div>
        <div class="stat-card">
          <div class="label">Projects Created</div>
          <div class="value">${data.projects.length}</div>
        </div>
      </div>
    </div>

    ${data.skills.length > 0 ? `
    <div class="section">
      <h2>Skills Inventory (${data.skills.length} skills)</h2>
      <div class="skill-list">
        ${data.skills.map((s: { skill_name: string; skill_level: number }) => 
          `<span class="skill-badge">${s.skill_name} (${s.skill_level}%)</span>`
        ).join("")}
      </div>
    </div>
    ` : ""}

    ${data.projects.length > 0 ? `
    <div class="section">
      <h2>Project Portfolio</h2>
      ${data.projects.map((p: { title: string }) => 
        `<div class="project-item">${p.title}</div>`
      ).join("")}
    </div>
    ` : ""}

    <div class="section">
      <div class="recommendations">
        <h3>Recommendations for Improvement</h3>
        <ul>
          ${data.skills.length < 5 ? "<li>Add more skills to your profile to showcase your expertise</li>" : ""}
          ${data.cvScore < 70 ? "<li>Upload and optimize your CV for better ATS scores</li>" : ""}
          ${data.interviews.length < 3 ? "<li>Complete more mock interviews to improve your interview skills</li>" : ""}
          ${data.projects.length < 3 ? "<li>Build more projects to strengthen your portfolio</li>" : ""}
          ${readinessScore >= 80 ? "<li>Excellent work! You're ready to start applying for positions.</li>" : ""}
          <li>Keep learning and practicing to maintain your skills</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>Generated by AI Job Readiness Platform</p>
      <p>This report provides an assessment based on your platform activity.</p>
    </div>
  </div>
</body>
</html>
    `

    // Return HTML as downloadable file (in production, you'd convert to PDF)
    // For now, we return the HTML which can be printed as PDF from browser
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="career-report-${new Date().toISOString().split("T")[0]}.html"`
      }
    })
  } catch (error) {
    console.error("Report generation error:", error)
    return Response.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
