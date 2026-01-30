// Default Email Templates - Commercial, Professional, and Creative Designs
// Each template has a unique style and purpose

export interface DefaultTemplate {
  id: string
  name: string
  category: 'welcome' | 'newsletter' | 'promotion' | 'announcement' | 'follow-up' | 'event' | 'transactional'
  description: string
  thumbnail: string // CSS gradient for preview
  subject: string
  html_body: string
}

export const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  // Template 1: Modern Gradient Welcome
  {
    id: 'modern-gradient-welcome',
    name: 'Modern Gradient Welcome',
    category: 'welcome',
    description: 'Eye-catching gradient header with clean typography for welcoming new subscribers',
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    subject: 'Welcome to {{company}}, {{name}}!',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #2d3748; margin: 0; padding: 0; background: #f7fafc; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 32px; margin: 0 0 10px 0; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; }
    .content { padding: 40px; }
    .content h2 { color: #667eea; font-size: 24px; margin: 0 0 20px 0; }
    .content p { margin: 0 0 15px 0; font-size: 16px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 30px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .features { background: #f7fafc; padding: 30px; border-radius: 10px; margin: 25px 0; }
    .feature-item { display: flex; align-items: center; margin: 15px 0; }
    .feature-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
    .footer { background: #2d3748; padding: 30px 40px; text-align: center; color: #a0aec0; }
    .footer p { margin: 5px 0; font-size: 14px; }
    .social-links { margin: 20px 0; }
    .social-link { display: inline-block; margin: 0 8px; color: #a0aec0; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Welcome, {{name}}!</h1>
      <p>We're thrilled to have you join us</p>
    </div>
    <div class="content">
      <h2>You're Part of Something Amazing</h2>
      <p>Hi {{name}},</p>
      <p>Thank you for joining <strong>{{company}}</strong>! We're excited to have you on board and can't wait to show you everything we have to offer.</p>

      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">1</div>
          <div><strong>Explore Our Platform</strong> - Discover all the features available to you</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">2</div>
          <div><strong>Set Up Your Profile</strong> - Personalize your experience</div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">3</div>
          <div><strong>Get Started</strong> - Begin your journey with us today</div>
        </div>
      </div>

      <p style="text-align: center;">
        <a href="#" class="cta-button">Get Started Now</a>
      </p>

      <p>If you have any questions, feel free to reach out to us at any time.</p>
      <p>Best regards,<br><strong>{{sender_name}}</strong><br>{{sender_position}}</p>
    </div>
    <div class="footer">
      <p><strong>{{sender_company}}</strong></p>
      <p>{{sender_email}} | {{sender_phone}}</p>
      <div class="social-links">
        <a href="#" class="social-link">Twitter</a>
        <a href="#" class="social-link">LinkedIn</a>
        <a href="#" class="social-link">Facebook</a>
      </div>
    </div>
  </div>
</body>
</html>`
  },

  // Template 2: Minimalist Newsletter
  {
    id: 'minimalist-newsletter',
    name: 'Minimalist Newsletter',
    category: 'newsletter',
    description: 'Clean and simple newsletter design with focus on readability',
    thumbnail: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    subject: 'This Week at {{company}} - Newsletter',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #1a202c; margin: 0; padding: 20px; background: #f7fafc; }
    .wrapper { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; }
    .header { padding: 40px 40px 30px; border-bottom: 2px solid #1a202c; }
    .logo { font-size: 28px; font-weight: 700; color: #1a202c; letter-spacing: -1px; margin: 0; }
    .date { color: #718096; font-size: 14px; margin-top: 5px; font-style: italic; }
    .content { padding: 40px; }
    .greeting { font-size: 18px; margin: 0 0 25px 0; }
    .article { margin: 30px 0; padding-bottom: 30px; border-bottom: 1px solid #e2e8f0; }
    .article:last-child { border-bottom: none; }
    .article-title { font-size: 22px; color: #1a202c; margin: 0 0 10px 0; }
    .article-excerpt { color: #4a5568; font-size: 16px; }
    .read-more { color: #1a202c; font-weight: 600; text-decoration: underline; }
    .quote-block { background: #f7fafc; padding: 25px 30px; border-left: 4px solid #1a202c; margin: 30px 0; font-style: italic; font-size: 18px; }
    .footer { background: #1a202c; padding: 30px 40px; color: #a0aec0; }
    .footer p { margin: 5px 0; font-size: 14px; }
    .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p class="logo">{{company}}</p>
      <p class="date">Weekly Newsletter</p>
    </div>
    <div class="content">
      <p class="greeting">Dear {{name}},</p>

      <p>Welcome to this week's newsletter. Here's what's been happening and what we think you'll find interesting.</p>

      <div class="article">
        <h2 class="article-title">Featured Story Title</h2>
        <p class="article-excerpt">Your main article content goes here. Write about something compelling that will capture your reader's attention and make them want to learn more.</p>
        <a href="#" class="read-more">Continue Reading →</a>
      </div>

      <div class="quote-block">
        "A powerful quote or key message that summarizes your newsletter's theme or inspires your readers."
      </div>

      <div class="article">
        <h2 class="article-title">What's Coming Next</h2>
        <p class="article-excerpt">Preview of upcoming content, events, or announcements that your subscribers should look forward to.</p>
      </div>

      <div class="signature">
        <p>Until next time,</p>
        <p><strong>{{sender_name}}</strong><br>{{sender_position}}, {{sender_company}}</p>
      </div>
    </div>
    <div class="footer">
      <p>{{sender_company}}</p>
      <p>{{sender_email}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 3: Bold Promotion
  {
    id: 'bold-promotion',
    name: 'Bold Promotion',
    category: 'promotion',
    description: 'High-impact promotional email with bold colors and strong CTA',
    thumbnail: 'linear-gradient(135deg, #f6ad55 0%, #ed8936 50%, #dd6b20 100%)',
    subject: 'Limited Time Offer: Exclusive Deal for {{name}}!',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Arial Black', Gadget, sans-serif; margin: 0; padding: 0; background: #1a202c; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .hero { background: linear-gradient(135deg, #f6ad55 0%, #ed8936 50%, #dd6b20 100%); padding: 60px 40px; text-align: center; }
    .badge { display: inline-block; background: #1a202c; color: #f6ad55; padding: 8px 20px; border-radius: 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px; }
    .hero h1 { color: #ffffff; font-size: 48px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: -1px; }
    .hero .discount { font-size: 80px; color: #1a202c; margin: 20px 0; font-weight: 900; }
    .hero p { color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-family: Arial, sans-serif; }
    .content { background: #ffffff; padding: 40px; text-align: center; }
    .content p { font-family: Arial, sans-serif; color: #4a5568; font-size: 16px; line-height: 1.7; }
    .cta-button { display: inline-block; background: #1a202c; color: #f6ad55; text-decoration: none; padding: 18px 50px; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; margin: 25px 0; font-weight: bold; }
    .cta-button:hover { background: #2d3748; }
    .timer { background: #f7fafc; padding: 25px; margin: 20px 0; }
    .timer-label { font-family: Arial, sans-serif; color: #718096; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .timer-boxes { display: flex; justify-content: center; gap: 15px; }
    .timer-box { background: #1a202c; color: #f6ad55; padding: 15px 20px; min-width: 60px; }
    .timer-box .number { font-size: 28px; font-weight: bold; }
    .timer-box .label { font-size: 10px; color: #a0aec0; font-family: Arial, sans-serif; text-transform: uppercase; }
    .footer { background: #1a202c; padding: 30px; text-align: center; color: #718096; font-family: Arial, sans-serif; font-size: 14px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="hero">
      <span class="badge">Limited Time Only</span>
      <h1>Flash Sale</h1>
      <div class="discount">50% OFF</div>
      <p>Exclusive offer just for you, {{name}}</p>
    </div>
    <div class="content">
      <div class="timer">
        <p class="timer-label">Offer Ends In</p>
        <div class="timer-boxes">
          <div class="timer-box"><div class="number">02</div><div class="label">Days</div></div>
          <div class="timer-box"><div class="number">14</div><div class="label">Hours</div></div>
          <div class="timer-box"><div class="number">36</div><div class="label">Mins</div></div>
        </div>
      </div>

      <p>Hey {{name}}, we've got something special for you from <strong>{{company}}</strong>!</p>
      <p>Don't miss out on this incredible opportunity. Use code <strong style="color: #ed8936;">SPECIAL50</strong> at checkout.</p>

      <a href="#" class="cta-button">Shop Now</a>

      <p style="font-size: 14px; color: #a0aec0;">*Terms and conditions apply. Cannot be combined with other offers.</p>
    </div>
    <div class="footer">
      <p>{{sender_company}}</p>
      <p>{{sender_email}} | {{sender_phone}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 4: Corporate Announcement
  {
    id: 'corporate-announcement',
    name: 'Corporate Announcement',
    category: 'announcement',
    description: 'Professional announcement template for corporate communications',
    thumbnail: 'linear-gradient(135deg, #0077b6 0%, #023e8a 100%)',
    subject: 'Important Update from {{company}}',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.7; color: #1e293b; margin: 0; padding: 0; background: #f1f5f9; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0077b6 0%, #023e8a 100%); padding: 35px 40px; }
    .logo { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
    .announcement-badge { display: inline-block; background: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 16px; border-radius: 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 15px; }
    .content { padding: 45px 40px; }
    .content h1 { color: #023e8a; font-size: 28px; margin: 0 0 25px 0; font-weight: 600; }
    .content p { margin: 0 0 18px 0; font-size: 16px; color: #475569; }
    .highlight-box { background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); border-left: 4px solid #0077b6; padding: 25px; margin: 30px 0; }
    .highlight-box h3 { color: #023e8a; margin: 0 0 10px 0; font-size: 18px; }
    .highlight-box p { margin: 0; color: #0369a1; }
    .cta-button { display: inline-block; background: #0077b6; color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 6px; font-weight: 600; font-size: 16px; margin: 20px 0; }
    .signature { margin-top: 35px; padding-top: 25px; border-top: 1px solid #e2e8f0; }
    .signature-name { font-weight: 600; color: #0f172a; margin: 0; }
    .signature-title { color: #64748b; font-size: 14px; margin: 5px 0 0 0; }
    .footer { background: #0f172a; padding: 30px 40px; }
    .footer p { color: #94a3b8; font-size: 14px; margin: 5px 0; }
    .footer a { color: #38bdf8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p class="logo">{{company}}</p>
      <span class="announcement-badge">Official Announcement</span>
    </div>
    <div class="content">
      <h1>Important Update</h1>

      <p>Dear {{name}},</p>

      <p>We are reaching out to share an important update regarding {{company}}. As part of our ongoing commitment to excellence, we want to ensure you are among the first to know about this development.</p>

      <div class="highlight-box">
        <h3>Key Announcement</h3>
        <p>Your main announcement details go here. Be clear and concise about what this announcement means for your recipients.</p>
      </div>

      <p>This change reflects our dedication to providing you with the best possible experience. We believe this update will bring significant improvements and value.</p>

      <p><strong>What This Means for You:</strong></p>
      <ul style="color: #475569;">
        <li>First key point about the impact</li>
        <li>Second important detail to note</li>
        <li>Third element they should be aware of</li>
      </ul>

      <p>Should you have any questions or concerns, please don't hesitate to reach out to us.</p>

      <a href="#" class="cta-button">Learn More</a>

      <div class="signature">
        <p class="signature-name">{{sender_name}}</p>
        <p class="signature-title">{{sender_position}}, {{sender_company}}</p>
      </div>
    </div>
    <div class="footer">
      <p><strong>{{sender_company}}</strong></p>
      <p>Contact: <a href="mailto:{{sender_email}}">{{sender_email}}</a> | {{sender_phone}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 5: Creative Follow-Up
  {
    id: 'creative-followup',
    name: 'Creative Follow-Up',
    category: 'follow-up',
    description: 'Engaging follow-up email with friendly tone and creative design',
    thumbnail: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    subject: 'Quick Check-in: How Can We Help, {{name}}?',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; margin: 0; padding: 20px; background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
    .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .header { padding: 50px 40px 30px; text-align: center; }
    .emoji { font-size: 60px; margin-bottom: 20px; }
    .header h1 { color: #1a202c; font-size: 28px; margin: 0; font-weight: 700; }
    .content { padding: 10px 40px 40px; }
    .content p { color: #4a5568; font-size: 16px; margin: 0 0 18px 0; }
    .question-box { background: linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%); border-radius: 15px; padding: 30px; margin: 25px 0; text-align: center; }
    .question-box p { color: #00695c; font-weight: 600; font-size: 18px; margin: 0; }
    .options { display: flex; flex-direction: column; gap: 12px; margin: 25px 0; }
    .option { display: block; background: #f7fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 18px 25px; text-decoration: none; color: #2d3748; font-weight: 500; transition: all 0.2s; }
    .option:hover { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); border-color: transparent; color: #1a202c; }
    .cta-button { display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center; margin-top: 25px; }
    .footer { background: #f7fafc; padding: 25px 40px; text-align: center; }
    .footer p { color: #718096; font-size: 14px; margin: 5px 0; }
    .signature { color: #2d3748; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="emoji">&#128075;</div>
      <h1>Hey {{name}}, just checking in!</h1>
    </div>
    <div class="content">
      <p>Hope you're doing great! I wanted to reach out and see how things are going since we last connected.</p>

      <div class="question-box">
        <p>Is there anything we can help you with today?</p>
      </div>

      <p>Here are some ways we can assist:</p>

      <div class="options">
        <a href="#" class="option">&#128172; I have a question</a>
        <a href="#" class="option">&#128736; I need technical support</a>
        <a href="#" class="option">&#128161; I have feedback to share</a>
        <a href="#" class="option">&#128077; Everything is great!</a>
      </div>

      <p>No matter what you need, we're here to help. Just hit reply or click the button below!</p>

      <a href="#" class="cta-button">Let's Chat</a>
    </div>
    <div class="footer">
      <p class="signature">{{sender_name}}</p>
      <p>{{sender_position}} at {{sender_company}}</p>
      <p>{{sender_email}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 6: Event Invitation
  {
    id: 'elegant-event',
    name: 'Elegant Event Invitation',
    category: 'event',
    description: 'Sophisticated event invitation with elegant typography',
    thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    subject: "You're Invited: Exclusive Event at {{company}}",
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Times New Roman', Times, serif; margin: 0; padding: 20px; background: #0a0a0a; }
    .wrapper { max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); border: 1px solid #2a2a4a; }
    .border-top { height: 4px; background: linear-gradient(90deg, #c9a227 0%, #f4d03f 50%, #c9a227 100%); }
    .header { padding: 60px 40px; text-align: center; border-bottom: 1px solid rgba(201, 162, 39, 0.2); }
    .header-label { color: #c9a227; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 20px; }
    .header h1 { color: #ffffff; font-size: 42px; margin: 0; font-weight: 400; letter-spacing: 2px; }
    .content { padding: 50px 40px; text-align: center; }
    .date-box { background: rgba(201, 162, 39, 0.1); border: 1px solid rgba(201, 162, 39, 0.3); padding: 30px; margin: 30px 0; }
    .date-label { color: #c9a227; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; }
    .date-value { color: #ffffff; font-size: 24px; margin: 10px 0 0 0; font-weight: 400; }
    .content p { color: #b8b8d0; font-size: 18px; line-height: 1.8; margin: 0 0 25px 0; }
    .details { margin: 40px 0; text-align: left; background: rgba(255,255,255,0.03); padding: 30px; border-radius: 4px; }
    .detail-item { display: flex; margin: 15px 0; }
    .detail-label { color: #c9a227; width: 100px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; }
    .detail-value { color: #ffffff; font-size: 16px; }
    .cta-button { display: inline-block; background: linear-gradient(90deg, #c9a227 0%, #f4d03f 100%); color: #1a1a2e; text-decoration: none; padding: 18px 50px; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700; margin: 30px 0; }
    .footer { background: #0f0f1a; padding: 30px 40px; text-align: center; border-top: 1px solid rgba(201, 162, 39, 0.2); }
    .footer p { color: #6b6b8a; font-size: 14px; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="border-top"></div>
    <div class="header">
      <p class="header-label">You Are Cordially Invited</p>
      <h1>Exclusive Event</h1>
    </div>
    <div class="content">
      <p>Dear {{name}},</p>
      <p>We request the pleasure of your company at an exclusive event hosted by {{company}}.</p>

      <div class="date-box">
        <p class="date-label">Save The Date</p>
        <p class="date-value">Saturday, March 15th, 2025</p>
      </div>

      <div class="details">
        <div class="detail-item">
          <span class="detail-label">Time</span>
          <span class="detail-value">7:00 PM - 10:00 PM</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Venue</span>
          <span class="detail-value">Grand Ballroom, Downtown</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Dress Code</span>
          <span class="detail-value">Black Tie Optional</span>
        </div>
      </div>

      <p>We look forward to celebrating with you.</p>

      <a href="#" class="cta-button">RSVP Now</a>

      <p style="font-size: 14px; color: #6b6b8a;">Kindly respond by March 1st, 2025</p>
    </div>
    <div class="footer">
      <p>{{sender_name}}, {{sender_position}}</p>
      <p>{{sender_company}}</p>
      <p>{{sender_email}} | {{sender_phone}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 7: Tech Product Launch
  {
    id: 'tech-launch',
    name: 'Tech Product Launch',
    category: 'announcement',
    description: 'Modern tech-focused template for product launches and announcements',
    thumbnail: 'linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%)',
    subject: 'Introducing Something Revolutionary from {{company}}',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; margin: 0; padding: 0; background: #0a0a0a; color: #ffffff; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 50px 40px; text-align: center; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(0,201,255,0.1) 0%, transparent 60%); }
    .badge { display: inline-block; background: linear-gradient(90deg, #00c9ff, #92fe9d); color: #0a0a0a; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; }
    .header h1 { font-size: 42px; margin: 0; font-weight: 700; background: linear-gradient(90deg, #00c9ff, #92fe9d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; position: relative; }
    .header p { color: #8b8b9a; font-size: 18px; margin: 15px 0 0 0; position: relative; }
    .visual { background: linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%); padding: 60px 40px; text-align: center; }
    .product-image { width: 200px; height: 200px; background: linear-gradient(135deg, rgba(0,201,255,0.2), rgba(146,254,157,0.2)); border-radius: 30px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 80px; }
    .content { background: #0a0a0a; padding: 40px; }
    .content p { color: #b8b8c8; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0; }
    .features { display: grid; gap: 20px; margin: 30px 0; }
    .feature { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 25px; }
    .feature-icon { font-size: 30px; margin-bottom: 12px; }
    .feature h3 { color: #ffffff; font-size: 18px; margin: 0 0 8px 0; }
    .feature p { color: #8b8b9a; font-size: 14px; margin: 0; }
    .cta-section { text-align: center; padding: 20px 0 40px; }
    .cta-button { display: inline-block; background: linear-gradient(90deg, #00c9ff, #92fe9d); color: #0a0a0a; text-decoration: none; padding: 16px 45px; border-radius: 30px; font-weight: 700; font-size: 16px; }
    .footer { background: #050505; padding: 30px 40px; text-align: center; }
    .footer p { color: #5a5a6a; font-size: 14px; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="badge">New Release</span>
      <h1>The Future is Here</h1>
      <p>Reimagined. Redesigned. Revolutionary.</p>
    </div>
    <div class="visual">
      <div class="product-image">&#128640;</div>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      <p>We're excited to announce something we've been working on at <strong style="color: #ffffff;">{{company}}</strong> - a breakthrough that will change everything you know.</p>

      <div class="features">
        <div class="feature">
          <div class="feature-icon">&#9889;</div>
          <h3>Lightning Fast</h3>
          <p>Experience performance like never before with our revolutionary technology.</p>
        </div>
        <div class="feature">
          <div class="feature-icon">&#127912;</div>
          <h3>Beautifully Designed</h3>
          <p>Every detail crafted to perfection for an unmatched experience.</p>
        </div>
        <div class="feature">
          <div class="feature-icon">&#128274;</div>
          <h3>Secure by Default</h3>
          <p>Your privacy and security are our top priorities, built in from day one.</p>
        </div>
      </div>

      <div class="cta-section">
        <a href="#" class="cta-button">Discover More</a>
      </div>
    </div>
    <div class="footer">
      <p>{{sender_name}} | {{sender_position}}</p>
      <p>{{sender_company}}</p>
      <p>{{sender_email}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 8: Warm Thank You
  {
    id: 'warm-thank-you',
    name: 'Warm Thank You',
    category: 'follow-up',
    description: 'Heartfelt thank you email with warm colors and personal touch',
    thumbnail: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    subject: 'Thank You, {{name}}! We Appreciate You',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Georgia', serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #fff5f5 0%, #fef5ff 100%); }
    .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 30px; overflow: hidden; box-shadow: 0 25px 50px rgba(255,154,158,0.2); }
    .header { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); padding: 60px 40px; text-align: center; }
    .heart { font-size: 70px; margin-bottom: 20px; }
    .header h1 { color: #ffffff; font-size: 36px; margin: 0; font-weight: 400; text-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .content { padding: 50px 45px; }
    .content p { color: #5a4a5a; font-size: 17px; line-height: 1.9; margin: 0 0 20px 0; }
    .highlight { background: linear-gradient(135deg, #fff5f5 0%, #fef5ff 100%); border-radius: 20px; padding: 30px; margin: 30px 0; text-align: center; }
    .highlight p { color: #c44569; font-size: 20px; font-style: italic; margin: 0; }
    .cta-button { display: block; background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 30px; font-size: 16px; text-align: center; margin: 30px 0; font-family: 'Segoe UI', sans-serif; font-weight: 600; box-shadow: 0 10px 30px rgba(255,154,158,0.3); }
    .signature { margin-top: 40px; padding-top: 30px; border-top: 1px solid #f5e6f5; }
    .signature p { margin: 5px 0; font-size: 16px; }
    .signature .name { color: #c44569; font-weight: 600; font-size: 18px; }
    .footer { background: #faf5fa; padding: 25px 40px; text-align: center; }
    .footer p { color: #9a8a9a; font-size: 14px; margin: 5px 0; font-family: 'Segoe UI', sans-serif; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="heart">&#128150;</div>
      <h1>Thank You!</h1>
    </div>
    <div class="content">
      <p>Dear {{name}},</p>

      <p>We wanted to take a moment to express our heartfelt gratitude. Your support means the world to us at {{company}}.</p>

      <div class="highlight">
        <p>"We are so grateful to have you as part of our community."</p>
      </div>

      <p>Whether it's been through your purchases, your feedback, or simply being part of our journey - every interaction with you has been a blessing.</p>

      <p>We truly believe that our success is built on relationships like ours, and we're committed to continuing to serve you with the same dedication and care.</p>

      <a href="#" class="cta-button">Share Your Story With Us</a>

      <div class="signature">
        <p class="name">With gratitude,</p>
        <p class="name">{{sender_name}}</p>
        <p>{{sender_position}}</p>
        <p>{{sender_company}}</p>
      </div>
    </div>
    <div class="footer">
      <p>{{sender_email}} | {{sender_phone}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 9: Newsletter Digest
  {
    id: 'newsletter-digest',
    name: 'Newsletter Digest',
    category: 'newsletter',
    description: 'Magazine-style newsletter with multiple article sections',
    thumbnail: 'linear-gradient(135deg, #5f72bd 0%, #9b23ea 100%)',
    subject: 'Your Weekly Digest from {{company}}',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f4f9; }
    .wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #5f72bd 0%, #9b23ea 100%); padding: 40px; }
    .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .logo { color: #ffffff; font-size: 22px; font-weight: 700; }
    .edition { color: rgba(255,255,255,0.8); font-size: 13px; }
    .header h1 { color: #ffffff; font-size: 32px; margin: 0 0 10px 0; }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; }
    .featured { padding: 35px 40px; background: #fafaff; border-bottom: 1px solid #e8e8f0; }
    .featured-label { color: #9b23ea; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
    .featured h2 { color: #1a1a2e; font-size: 26px; margin: 0 0 15px 0; }
    .featured p { color: #5a5a7a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0; }
    .read-more { color: #9b23ea; font-weight: 600; text-decoration: none; }
    .articles { padding: 35px 40px; }
    .article-grid { display: grid; gap: 25px; }
    .article { display: flex; gap: 20px; padding-bottom: 25px; border-bottom: 1px solid #e8e8f0; }
    .article:last-child { border-bottom: none; padding-bottom: 0; }
    .article-image { width: 100px; height: 80px; background: linear-gradient(135deg, #5f72bd 0%, #9b23ea 100%); border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 30px; }
    .article-content h3 { color: #1a1a2e; font-size: 17px; margin: 0 0 8px 0; }
    .article-content p { color: #6a6a8a; font-size: 14px; line-height: 1.6; margin: 0; }
    .cta-section { background: linear-gradient(135deg, #5f72bd 0%, #9b23ea 100%); padding: 40px; text-align: center; }
    .cta-section h3 { color: #ffffff; font-size: 22px; margin: 0 0 15px 0; }
    .cta-section p { color: rgba(255,255,255,0.9); font-size: 15px; margin: 0 0 20px 0; }
    .cta-button { display: inline-block; background: #ffffff; color: #9b23ea; text-decoration: none; padding: 14px 35px; border-radius: 25px; font-weight: 600; font-size: 15px; }
    .footer { background: #1a1a2e; padding: 30px 40px; }
    .footer p { color: #8a8aa0; font-size: 14px; margin: 5px 0; text-align: center; }
    .social { text-align: center; margin-bottom: 20px; }
    .social a { display: inline-block; margin: 0 8px; color: #8a8aa0; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-top">
        <span class="logo">{{company}}</span>
        <span class="edition">Weekly Digest</span>
      </div>
      <h1>Hello {{name}}!</h1>
      <p>Here's what you missed this week</p>
    </div>

    <div class="featured">
      <p class="featured-label">Featured Story</p>
      <h2>Your Main Article Headline Goes Here</h2>
      <p>This is where your featured article excerpt appears. Make it compelling and give readers a reason to click through and read more about this topic.</p>
      <a href="#" class="read-more">Read Full Article →</a>
    </div>

    <div class="articles">
      <div class="article-grid">
        <div class="article">
          <div class="article-image">&#128240;</div>
          <div class="article-content">
            <h3>Second Article Title</h3>
            <p>Brief description of this article that entices readers to learn more about the topic.</p>
          </div>
        </div>
        <div class="article">
          <div class="article-image">&#128161;</div>
          <div class="article-content">
            <h3>Third Article Title</h3>
            <p>Another engaging summary that makes readers curious about what's inside.</p>
          </div>
        </div>
        <div class="article">
          <div class="article-image">&#127775;</div>
          <div class="article-content">
            <h3>Fourth Article Title</h3>
            <p>Keep your summaries short but interesting to maintain reader engagement.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <h3>Want More Content?</h3>
      <p>Subscribe to get daily updates delivered to your inbox.</p>
      <a href="#" class="cta-button">Subscribe Now</a>
    </div>

    <div class="footer">
      <div class="social">
        <a href="#">Twitter</a>
        <a href="#">LinkedIn</a>
        <a href="#">Instagram</a>
      </div>
      <p>{{sender_company}} | {{sender_email}}</p>
      <p>Sent by {{sender_name}}, {{sender_position}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 10: Seasonal Sale
  {
    id: 'seasonal-sale',
    name: 'Seasonal Sale',
    category: 'promotion',
    description: 'Festive promotional template with seasonal design elements',
    thumbnail: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    subject: 'Seasonal Savings Just for You, {{name}}!',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Trebuchet MS', sans-serif; margin: 0; padding: 0; background: #0d3320; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .hero { background: linear-gradient(135deg, #134e5e 0%, #71b280 100%); padding: 60px 40px; text-align: center; position: relative; overflow: hidden; }
    .snowflakes { position: absolute; top: 0; left: 0; right: 0; font-size: 24px; color: rgba(255,255,255,0.3); letter-spacing: 30px; }
    .hero-content { position: relative; z-index: 1; }
    .season-label { color: rgba(255,255,255,0.9); font-size: 14px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 15px; }
    .hero h1 { color: #ffffff; font-size: 48px; margin: 0 0 10px 0; text-shadow: 0 3px 15px rgba(0,0,0,0.2); }
    .hero .subtitle { color: rgba(255,255,255,0.95); font-size: 22px; margin: 0; }
    .offer-box { background: #ffffff; margin: -30px 30px 0; border-radius: 15px; padding: 40px; text-align: center; position: relative; z-index: 2; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
    .discount-circle { width: 120px; height: 120px; background: linear-gradient(135deg, #134e5e 0%, #71b280 100%); border-radius: 50%; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; }
    .discount-circle span { color: #ffffff; font-size: 36px; font-weight: 700; }
    .offer-box h2 { color: #134e5e; font-size: 26px; margin: 0 0 15px 0; }
    .offer-box p { color: #5a6a5a; font-size: 16px; line-height: 1.7; margin: 0 0 25px 0; }
    .promo-code { background: #f0f7f0; border: 2px dashed #71b280; border-radius: 10px; padding: 15px 30px; display: inline-block; margin: 15px 0; }
    .promo-code span { color: #134e5e; font-size: 24px; font-weight: 700; letter-spacing: 3px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #134e5e 0%, #71b280 100%); color: #ffffff; text-decoration: none; padding: 16px 45px; border-radius: 30px; font-weight: 700; font-size: 16px; margin: 20px 0; box-shadow: 0 8px 25px rgba(19,78,94,0.3); }
    .products { background: #f7faf7; padding: 40px 30px; }
    .products h3 { text-align: center; color: #134e5e; font-size: 22px; margin: 0 0 25px 0; }
    .product-grid { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
    .product { background: #ffffff; border-radius: 12px; padding: 20px; width: 150px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
    .product-icon { font-size: 40px; margin-bottom: 10px; }
    .product p { color: #3a5a3a; font-size: 14px; margin: 0; }
    .footer { background: #134e5e; padding: 30px 40px; text-align: center; }
    .footer p { color: rgba(255,255,255,0.8); font-size: 14px; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="hero">
      <div class="snowflakes">&#10052; &#10052; &#10052; &#10052; &#10052;</div>
      <div class="hero-content">
        <p class="season-label">Seasonal Collection</p>
        <h1>Holiday Sale</h1>
        <p class="subtitle">Exclusive deals for {{name}}</p>
      </div>
    </div>

    <div class="offer-box">
      <div class="discount-circle">
        <span>30%</span>
      </div>
      <h2>Your Special Discount</h2>
      <p>Celebrate the season with amazing savings from {{company}}. Use your exclusive code below at checkout.</p>
      <div class="promo-code">
        <span>SEASON30</span>
      </div>
      <br>
      <a href="#" class="cta-button">Shop the Sale</a>
      <p style="font-size: 13px; color: #8a9a8a; margin-top: 20px;">*Valid until end of season. Some exclusions apply.</p>
    </div>

    <div class="products">
      <h3>Popular This Season</h3>
      <div class="product-grid">
        <div class="product">
          <div class="product-icon">&#127873;</div>
          <p>Gift Sets</p>
        </div>
        <div class="product">
          <div class="product-icon">&#127876;</div>
          <p>Decorations</p>
        </div>
        <div class="product">
          <div class="product-icon">&#128717;</div>
          <p>Essentials</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>{{sender_company}}</strong></p>
      <p>{{sender_name}} | {{sender_email}}</p>
      <p>{{sender_phone}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 11: Professional Services
  {
    id: 'professional-services',
    name: 'Professional Services',
    category: 'welcome',
    description: 'Clean B2B template for professional service providers',
    thumbnail: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)',
    subject: 'Partnership Proposal from {{company}}',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #2c3e50; margin: 0; padding: 0; background: #ecf0f1; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 0 30px rgba(0,0,0,0.08); }
    .top-bar { height: 5px; background: linear-gradient(90deg, #373b44 0%, #4286f4 100%); }
    .header { padding: 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ecf0f1; }
    .logo { font-size: 24px; font-weight: 700; color: #2c3e50; }
    .contact-info { text-align: right; font-size: 13px; color: #7f8c8d; }
    .content { padding: 45px 40px; }
    .content h1 { color: #2c3e50; font-size: 28px; margin: 0 0 25px 0; font-weight: 600; }
    .content p { margin: 0 0 18px 0; font-size: 15px; color: #5d6d7e; }
    .services { margin: 35px 0; }
    .service { display: flex; align-items: flex-start; gap: 20px; margin: 25px 0; padding: 25px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #4286f4; }
    .service-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #373b44 0%, #4286f4 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; flex-shrink: 0; }
    .service-content h3 { color: #2c3e50; font-size: 18px; margin: 0 0 8px 0; }
    .service-content p { color: #7f8c8d; font-size: 14px; margin: 0; }
    .cta-section { background: linear-gradient(135deg, #373b44 0%, #4286f4 100%); padding: 35px; text-align: center; border-radius: 8px; margin: 30px 0; }
    .cta-section p { color: rgba(255,255,255,0.9); font-size: 18px; margin: 0 0 20px 0; }
    .cta-button { display: inline-block; background: #ffffff; color: #4286f4; text-decoration: none; padding: 14px 40px; border-radius: 5px; font-weight: 600; font-size: 15px; }
    .signature { margin-top: 35px; padding-top: 25px; border-top: 1px solid #ecf0f1; }
    .signature-photo { width: 60px; height: 60px; background: #ecf0f1; border-radius: 50%; display: inline-block; margin-right: 15px; vertical-align: middle; text-align: center; line-height: 60px; font-size: 24px; }
    .signature-info { display: inline-block; vertical-align: middle; }
    .signature-name { font-weight: 600; color: #2c3e50; margin: 0; }
    .signature-title { color: #7f8c8d; font-size: 14px; margin: 3px 0 0 0; }
    .footer { background: #2c3e50; padding: 25px 40px; }
    .footer p { color: #95a5a6; font-size: 13px; margin: 5px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="top-bar"></div>
    <div class="header">
      <span class="logo">{{company}}</span>
      <div class="contact-info">
        {{sender_phone}}<br>
        {{sender_email}}
      </div>
    </div>
    <div class="content">
      <h1>Let's Work Together</h1>

      <p>Dear {{name}},</p>

      <p>Thank you for your interest in {{company}}. We specialize in delivering exceptional results for businesses like yours, and we're excited about the opportunity to collaborate.</p>

      <div class="services">
        <div class="service">
          <div class="service-icon">&#128200;</div>
          <div class="service-content">
            <h3>Strategic Consulting</h3>
            <p>Data-driven strategies tailored to your business goals and market position.</p>
          </div>
        </div>
        <div class="service">
          <div class="service-icon">&#128736;</div>
          <div class="service-content">
            <h3>Implementation Support</h3>
            <p>Hands-on assistance to ensure smooth execution and adoption.</p>
          </div>
        </div>
        <div class="service">
          <div class="service-icon">&#127919;</div>
          <div class="service-content">
            <h3>Performance Optimization</h3>
            <p>Continuous improvement to maximize your return on investment.</p>
          </div>
        </div>
      </div>

      <div class="cta-section">
        <p>Ready to discuss how we can help?</p>
        <a href="#" class="cta-button">Schedule a Consultation</a>
      </div>

      <div class="signature">
        <span class="signature-photo">&#128100;</span>
        <div class="signature-info">
          <p class="signature-name">{{sender_name}}</p>
          <p class="signature-title">{{sender_position}}, {{sender_company}}</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <p>{{sender_company}} | Professional Services</p>
      <p>{{sender_email}} | {{sender_phone}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 12: Webinar Invitation
  {
    id: 'webinar-invitation',
    name: 'Webinar Invitation',
    category: 'event',
    description: 'Modern webinar/online event invitation template',
    thumbnail: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    subject: 'Join Our Live Webinar: Free Registration for {{name}}',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%); padding: 50px 40px; text-align: center; position: relative; }
    .live-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.2); color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 25px; }
    .live-dot { width: 8px; height: 8px; background: #ffffff; border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .header h1 { color: #ffffff; font-size: 34px; margin: 0 0 15px 0; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); font-size: 17px; margin: 0; }
    .content { background: #ffffff; padding: 45px 40px; }
    .date-time { display: flex; justify-content: center; gap: 30px; margin-bottom: 35px; }
    .date-block { text-align: center; padding: 20px 30px; background: #f8f9fa; border-radius: 12px; }
    .date-icon { font-size: 28px; margin-bottom: 8px; }
    .date-label { color: #ee0979; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .date-value { color: #1a1a2e; font-size: 16px; font-weight: 600; margin-top: 5px; }
    .content p { color: #5a5a7a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0; text-align: center; }
    .topics { background: #fef5f0; border-radius: 15px; padding: 30px; margin: 30px 0; }
    .topics h3 { color: #ee0979; font-size: 18px; margin: 0 0 20px 0; text-align: center; }
    .topic-list { list-style: none; padding: 0; margin: 0; }
    .topic-list li { display: flex; align-items: center; gap: 12px; padding: 10px 0; color: #4a4a6a; font-size: 15px; }
    .topic-list li::before { content: '✓'; color: #ee0979; font-weight: bold; }
    .speaker { display: flex; align-items: center; gap: 20px; background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 30px 0; }
    .speaker-photo { width: 80px; height: 80px; background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; flex-shrink: 0; }
    .speaker-info h4 { color: #1a1a2e; font-size: 18px; margin: 0 0 5px 0; }
    .speaker-info p { color: #7a7a9a; font-size: 14px; margin: 0; }
    .cta-button { display: block; background: linear-gradient(135deg, #ee0979 0%, #ff6a00 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 30px; font-weight: 700; font-size: 17px; text-align: center; margin: 30px 0; box-shadow: 0 10px 30px rgba(238,9,121,0.3); }
    .footer { background: #1a1a2e; padding: 30px 40px; text-align: center; }
    .footer p { color: #7a7a9a; font-size: 14px; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="live-badge"><span class="live-dot"></span>Live Webinar</span>
      <h1>Learn From The Experts</h1>
      <p>Free online session hosted by {{company}}</p>
    </div>
    <div class="content">
      <div class="date-time">
        <div class="date-block">
          <div class="date-icon">&#128197;</div>
          <p class="date-label">Date</p>
          <p class="date-value">March 20, 2025</p>
        </div>
        <div class="date-block">
          <div class="date-icon">&#128339;</div>
          <p class="date-label">Time</p>
          <p class="date-value">2:00 PM EST</p>
        </div>
      </div>

      <p>Hi {{name}}, you're invited to join our exclusive live webinar where industry experts will share valuable insights and strategies.</p>

      <div class="topics">
        <h3>What You'll Learn</h3>
        <ul class="topic-list">
          <li>Key industry trends and how to leverage them</li>
          <li>Practical strategies you can implement immediately</li>
          <li>Expert tips and best practices</li>
          <li>Live Q&A session with our speakers</li>
        </ul>
      </div>

      <div class="speaker">
        <div class="speaker-photo">&#128100;</div>
        <div class="speaker-info">
          <h4>{{sender_name}}</h4>
          <p>{{sender_position}} at {{sender_company}}</p>
          <p style="margin-top: 5px; color: #ee0979; font-weight: 500;">Featured Speaker</p>
        </div>
      </div>

      <a href="#" class="cta-button">Reserve Your Spot Free</a>

      <p style="font-size: 14px; color: #9a9aba;">Limited seats available. Register now to secure your spot!</p>
    </div>
    <div class="footer">
      <p>{{sender_company}}</p>
      <p>{{sender_email}} | {{sender_phone}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 13: Order Confirmation
  {
    id: 'order-confirmation',
    name: 'Order Confirmation',
    category: 'transactional',
    description: 'Clean transactional email for order confirmations',
    thumbnail: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    subject: 'Order Confirmed! Thanks for your purchase, {{name}}',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background: #f0fdf4; }
    .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 45px 40px; text-align: center; }
    .checkmark { width: 70px; height: 70px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 36px; }
    .header h1 { color: #ffffff; font-size: 28px; margin: 0 0 8px 0; font-weight: 600; }
    .header p { color: rgba(255,255,255,0.9); font-size: 15px; margin: 0; }
    .content { padding: 40px; }
    .order-number { background: #f0fdf4; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 30px; }
    .order-number-label { color: #6b7b6b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .order-number-value { color: #11998e; font-size: 24px; font-weight: 700; margin-top: 5px; }
    .content p { color: #4a5a4a; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0; }
    .order-details { border: 1px solid #e5f5e5; border-radius: 12px; overflow: hidden; margin: 25px 0; }
    .order-header { background: #f0fdf4; padding: 15px 20px; font-weight: 600; color: #2a3a2a; }
    .order-item { display: flex; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid #e5f5e5; }
    .order-item:last-child { border-bottom: none; }
    .item-name { color: #3a4a3a; }
    .item-price { color: #11998e; font-weight: 600; }
    .order-total { display: flex; justify-content: space-between; padding: 20px; background: #f0fdf4; }
    .total-label { font-weight: 600; color: #2a3a2a; }
    .total-value { font-size: 20px; font-weight: 700; color: #11998e; }
    .shipping-info { background: #fafafa; border-radius: 10px; padding: 20px; margin: 25px 0; }
    .shipping-info h3 { color: #3a4a3a; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px; }
    .shipping-info p { color: #6a7a6a; font-size: 14px; margin: 0; line-height: 1.6; }
    .cta-button { display: block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #ffffff; text-decoration: none; padding: 16px 35px; border-radius: 10px; font-weight: 600; font-size: 15px; text-align: center; margin: 25px 0; }
    .footer { background: #f8f8f8; padding: 25px 40px; text-align: center; }
    .footer p { color: #8a9a8a; font-size: 13px; margin: 5px 0; }
    .footer a { color: #11998e; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="checkmark">&#10003;</div>
      <h1>Order Confirmed!</h1>
      <p>Thank you for your purchase, {{name}}</p>
    </div>
    <div class="content">
      <div class="order-number">
        <p class="order-number-label">Order Number</p>
        <p class="order-number-value">#ORD-2024-12345</p>
      </div>

      <p>Hi {{name}}, we've received your order and we're getting it ready. We'll notify you when it ships!</p>

      <div class="order-details">
        <div class="order-header">Order Summary</div>
        <div class="order-item">
          <span class="item-name">Product Item 1 x1</span>
          <span class="item-price">$49.00</span>
        </div>
        <div class="order-item">
          <span class="item-name">Product Item 2 x2</span>
          <span class="item-price">$78.00</span>
        </div>
        <div class="order-item">
          <span class="item-name">Shipping</span>
          <span class="item-price">$5.00</span>
        </div>
        <div class="order-total">
          <span class="total-label">Total</span>
          <span class="total-value">$132.00</span>
        </div>
      </div>

      <div class="shipping-info">
        <h3>Shipping Address</h3>
        <p>{{name}}<br>123 Example Street<br>City, State 12345<br>Country</p>
      </div>

      <a href="#" class="cta-button">Track Your Order</a>

      <p style="text-align: center; font-size: 14px; color: #8a9a8a;">Questions? Contact us at {{sender_email}}</p>
    </div>
    <div class="footer">
      <p><strong>{{sender_company}}</strong></p>
      <p>{{sender_email}} | {{sender_phone}}</p>
      <p><a href="#">View Order</a> | <a href="#">Contact Support</a></p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 14: Re-engagement
  {
    id: 'reengagement',
    name: 'Re-engagement Campaign',
    category: 'follow-up',
    description: 'Win-back email to re-engage inactive subscribers',
    thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    subject: 'We Miss You, {{name}}! Come Back for a Special Surprise',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); }
    .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 25px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.15); }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 55px 40px; text-align: center; }
    .emoji-large { font-size: 65px; margin-bottom: 20px; }
    .header h1 { color: #ffffff; font-size: 32px; margin: 0 0 10px 0; font-weight: 600; }
    .header p { color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; }
    .content { padding: 45px 40px; text-align: center; }
    .content p { color: #5a4a6a; font-size: 16px; line-height: 1.8; margin: 0 0 22px 0; }
    .offer-card { background: linear-gradient(135deg, #fff0f5 0%, #fff5f5 100%); border-radius: 20px; padding: 35px; margin: 30px 0; }
    .offer-card h2 { color: #f5576c; font-size: 42px; margin: 0 0 10px 0; font-weight: 700; }
    .offer-card p { color: #8a6a7a; font-size: 18px; margin: 0; }
    .promo-code-box { background: #ffffff; border: 3px dashed #f5576c; border-radius: 12px; padding: 15px 30px; display: inline-block; margin-top: 20px; }
    .promo-code-box span { color: #f5576c; font-size: 22px; font-weight: 700; letter-spacing: 4px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 30px; font-weight: 700; font-size: 17px; margin: 25px 0; box-shadow: 0 10px 30px rgba(245,87,108,0.3); }
    .features { display: flex; justify-content: center; gap: 40px; margin: 35px 0; flex-wrap: wrap; }
    .feature { text-align: center; }
    .feature-icon { font-size: 35px; margin-bottom: 8px; }
    .feature p { color: #7a6a8a; font-size: 13px; margin: 0; }
    .question { background: #f9f5fa; border-radius: 15px; padding: 25px; margin: 30px 0; }
    .question p { color: #6a5a7a; font-size: 15px; margin: 0; }
    .question a { color: #f5576c; font-weight: 600; text-decoration: none; }
    .footer { background: #faf5fa; padding: 25px 40px; text-align: center; }
    .footer p { color: #9a8a9a; font-size: 13px; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="emoji-large">&#128148;</div>
      <h1>We Miss You!</h1>
      <p>It's been a while, {{name}}</p>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      <p>We noticed you haven't visited us in a while, and we really miss having you around! At {{company}}, you're more than just a customer — you're part of our family.</p>

      <div class="offer-card">
        <h2>20% OFF</h2>
        <p>Your exclusive welcome back discount</p>
        <div class="promo-code-box">
          <span>COMEBACK20</span>
        </div>
      </div>

      <p>Use this special code on your next order and save!</p>

      <a href="#" class="cta-button">Shop Now & Save</a>

      <div class="features">
        <div class="feature">
          <div class="feature-icon">&#127873;</div>
          <p>New Arrivals</p>
        </div>
        <div class="feature">
          <div class="feature-icon">&#11088;</div>
          <p>Best Sellers</p>
        </div>
        <div class="feature">
          <div class="feature-icon">&#128176;</div>
          <p>Special Deals</p>
        </div>
      </div>

      <div class="question">
        <p>Not interested anymore? We'd love to know why. <a href="#">Give us feedback</a> and help us improve!</p>
      </div>
    </div>
    <div class="footer">
      <p>With love,</p>
      <p><strong>{{sender_name}}</strong> | {{sender_position}}</p>
      <p>{{sender_company}}</p>
      <p>{{sender_email}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 15: Survey Request
  {
    id: 'survey-request',
    name: 'Feedback Survey',
    category: 'follow-up',
    description: 'Clean survey request template for gathering customer feedback',
    thumbnail: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    subject: '{{name}}, Your Feedback Matters to Us!',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #e8f4f8; }
    .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 50px 40px; text-align: center; }
    .header-icon { font-size: 55px; margin-bottom: 20px; }
    .header h1 { color: #ffffff; font-size: 28px; margin: 0 0 10px 0; }
    .header p { color: rgba(255,255,255,0.9); font-size: 15px; margin: 0; }
    .content { padding: 45px 40px; }
    .content p { color: #4a5a6a; font-size: 16px; line-height: 1.7; margin: 0 0 22px 0; }
    .rating-section { background: #f5f9ff; border-radius: 15px; padding: 30px; margin: 30px 0; text-align: center; }
    .rating-section p { color: #3a5a7a; font-size: 17px; font-weight: 500; margin: 0 0 20px 0; }
    .rating-buttons { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
    .rating-btn { display: inline-flex; align-items: center; justify-content: center; width: 45px; height: 45px; background: #ffffff; border: 2px solid #e0eaf0; border-radius: 10px; text-decoration: none; font-size: 18px; font-weight: 600; color: #4a6a8a; transition: all 0.2s; }
    .rating-btn:hover { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #ffffff; border-color: transparent; }
    .rating-labels { display: flex; justify-content: space-between; margin-top: 12px; padding: 0 5px; }
    .rating-labels span { color: #8a9aaa; font-size: 12px; }
    .time-note { background: #f0f8ff; border-radius: 10px; padding: 18px; margin: 25px 0; display: flex; align-items: center; gap: 15px; }
    .time-icon { font-size: 28px; }
    .time-text { color: #4a6a8a; font-size: 14px; }
    .time-text strong { color: #2a4a6a; }
    .cta-button { display: block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center; margin: 25px 0; }
    .skip-link { text-align: center; }
    .skip-link a { color: #8a9aaa; font-size: 14px; text-decoration: none; }
    .footer { background: #f8fafc; padding: 25px 40px; text-align: center; }
    .footer p { color: #8a9aaa; font-size: 13px; margin: 5px 0; }
    .signature { color: #4a6a8a; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-icon">&#128172;</div>
      <h1>We Value Your Opinion</h1>
      <p>Help us serve you better</p>
    </div>
    <div class="content">
      <p>Hi {{name}},</p>
      <p>At {{company}}, we're always looking for ways to improve. Your feedback helps us understand what we're doing well and where we can do better.</p>

      <div class="rating-section">
        <p>How likely are you to recommend us?</p>
        <div class="rating-buttons">
          <a href="#" class="rating-btn">0</a>
          <a href="#" class="rating-btn">1</a>
          <a href="#" class="rating-btn">2</a>
          <a href="#" class="rating-btn">3</a>
          <a href="#" class="rating-btn">4</a>
          <a href="#" class="rating-btn">5</a>
          <a href="#" class="rating-btn">6</a>
          <a href="#" class="rating-btn">7</a>
          <a href="#" class="rating-btn">8</a>
          <a href="#" class="rating-btn">9</a>
          <a href="#" class="rating-btn">10</a>
        </div>
        <div class="rating-labels">
          <span>Not likely</span>
          <span>Very likely</span>
        </div>
      </div>

      <div class="time-note">
        <div class="time-icon">&#9201;</div>
        <div class="time-text">
          <strong>Just 2 minutes</strong> is all we need.<br>
          Your insights make a real difference!
        </div>
      </div>

      <a href="#" class="cta-button">Take the Full Survey</a>

      <p style="text-align: center; font-size: 14px; color: #8a9aaa;">As a thank you, you'll be entered to win a $100 gift card!</p>

      <div class="skip-link">
        <a href="#">No thanks, maybe later</a>
      </div>
    </div>
    <div class="footer">
      <p class="signature">Thank you for being awesome!</p>
      <p>{{sender_name}}, {{sender_position}}</p>
      <p>{{sender_company}}</p>
      <p>{{sender_email}}</p>
    </div>
  </div>
</body>
</html>`
  },

  // Template 16: Referral Program
  {
    id: 'referral-program',
    name: 'Referral Program',
    category: 'promotion',
    description: 'Engaging referral program invitation email',
    thumbnail: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    subject: 'Share the Love, {{name}}! Get Rewarded for Referrals',
    html_body: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); min-height: 100vh; }
    .wrapper { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 25px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.12); }
    .header { padding: 55px 40px; text-align: center; background: linear-gradient(180deg, #ffffff 0%, #f8fcfc 100%); }
    .gift-icon { font-size: 70px; margin-bottom: 20px; }
    .header h1 { color: #2d3a4a; font-size: 32px; margin: 0 0 12px 0; font-weight: 700; }
    .header p { color: #6a7a8a; font-size: 16px; margin: 0; }
    .reward-banner { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 35px; margin: 0 25px; border-radius: 20px; margin-top: -30px; position: relative; z-index: 1; }
    .reward-banner h2 { color: #ffffff; font-size: 38px; margin: 0 0 5px 0; text-align: center; }
    .reward-banner p { color: rgba(255,255,255,0.9); font-size: 15px; margin: 0; text-align: center; }
    .content { padding: 40px; }
    .content p { color: #5a6a7a; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0; text-align: center; }
    .steps { margin: 30px 0; }
    .step { display: flex; align-items: flex-start; gap: 20px; margin: 20px 0; }
    .step-number { width: 45px; height: 45px; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #667eea; font-weight: 700; font-size: 18px; flex-shrink: 0; }
    .step-content h3 { color: #2d3a4a; font-size: 17px; margin: 0 0 5px 0; }
    .step-content p { color: #7a8a9a; font-size: 14px; margin: 0; text-align: left; }
    .referral-code { background: #f5f8fa; border: 2px dashed #cbd5e0; border-radius: 15px; padding: 25px; margin: 30px 0; text-align: center; }
    .referral-code-label { color: #6a7a8a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .referral-code-value { color: #667eea; font-size: 28px; font-weight: 700; letter-spacing: 3px; }
    .share-buttons { display: flex; justify-content: center; gap: 15px; margin: 30px 0; }
    .share-btn { display: inline-flex; align-items: center; gap: 8px; background: #f0f5ff; color: #667eea; text-decoration: none; padding: 12px 25px; border-radius: 25px; font-weight: 600; font-size: 14px; }
    .cta-button { display: block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 30px; font-weight: 700; font-size: 16px; text-align: center; margin: 25px 0; box-shadow: 0 10px 30px rgba(102,126,234,0.3); }
    .footer { background: #f8fafc; padding: 25px 40px; text-align: center; }
    .footer p { color: #8a9aaa; font-size: 13px; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="gift-icon">&#127873;</div>
      <h1>Share & Earn</h1>
      <p>Invite friends. Get rewarded. It's that simple!</p>
    </div>
    <div class="reward-banner">
      <h2>$25 + $25</h2>
      <p>You get $25, your friend gets $25</p>
    </div>
    <div class="content">
      <p>Hey {{name}}! Loving {{company}}? Share the experience with your friends and family, and we'll reward both of you!</p>

      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Share Your Code</h3>
            <p>Send your unique referral code to friends via email, social media, or text.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Friend Signs Up</h3>
            <p>When they sign up using your code, they get $25 off their first purchase.</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>You Get Rewarded</h3>
            <p>Once they complete their purchase, you receive $25 credit automatically!</p>
          </div>
        </div>
      </div>

      <div class="referral-code">
        <p class="referral-code-label">Your Personal Referral Code</p>
        <p class="referral-code-value">FRIEND25</p>
      </div>

      <div class="share-buttons">
        <a href="#" class="share-btn">&#128231; Email</a>
        <a href="#" class="share-btn">&#128242; Text</a>
        <a href="#" class="share-btn">&#128279; Copy Link</a>
      </div>

      <a href="#" class="cta-button">Start Sharing Now</a>

      <p style="font-size: 13px; color: #9aaaba;">*Terms and conditions apply. Referral credits valid for 90 days.</p>
    </div>
    <div class="footer">
      <p>Questions? Contact {{sender_email}}</p>
      <p>{{sender_company}}</p>
    </div>
  </div>
</body>
</html>`
  },
]

// Helper function to get templates by category
export function getTemplatesByCategory(category: DefaultTemplate['category']): DefaultTemplate[] {
  return DEFAULT_TEMPLATES.filter(t => t.category === category)
}

// Helper function to get all categories
export function getCategories(): { id: DefaultTemplate['category']; label: string; count: number }[] {
  const categories: { id: DefaultTemplate['category']; label: string }[] = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'promotion', label: 'Promotion' },
    { id: 'announcement', label: 'Announcement' },
    { id: 'follow-up', label: 'Follow-up' },
    { id: 'event', label: 'Event' },
    { id: 'transactional', label: 'Transactional' },
  ]

  return categories.map(cat => ({
    ...cat,
    count: DEFAULT_TEMPLATES.filter(t => t.category === cat.id).length
  }))
}
