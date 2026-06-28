const axios = require('axios');
const nodemailer = require('nodemailer');
const Evaluation = require('../models/Evaluation');
const User = require('../models/User');

/**
 * Computes rolling average of last N composite scores for a user.
 * If latest score is significantly below the rolling average, fires an alert.
 */
async function checkForRegression(userId, latestScore) {
  const user = await User.findById(userId).select('alertConfig email name').lean();
  if (!user?.alertConfig?.enabled) return;

  const { thresholdDrop, windowSize, slackWebhookUrl, alertEmail } = user.alertConfig;

  // Get rolling window of recent eval scores
  const recentEvals = await Evaluation.find(
    { userId, status: 'complete' },
    { compositeScore: 1 }
  )
    .sort({ createdAt: -1 })
    .limit(windowSize)
    .lean();

  if (recentEvals.length < 10) return; // need baseline data first to establish normal scores

  const scores = recentEvals.map(e => e.compositeScore);
  const rollingAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const drop = rollingAvg - latestScore;

  if (drop >= thresholdDrop) {
    const message = buildAlertMessage({ user, latestScore, rollingAvg, drop, windowSize });

    // Fire alerts in parallel
    const promises = [];
    if (slackWebhookUrl) promises.push(sendSlackAlert(slackWebhookUrl, message));
    if (alertEmail) promises.push(sendEmailAlert(alertEmail, message, user.name));

    await Promise.allSettled(promises);
    console.log(`ALERT fired for user ${userId}: score drop of ${drop.toFixed(3)}`);
  }
}

function buildAlertMessage({ user, latestScore, rollingAvg, drop, windowSize }) {
  return {
    title: '🚨 AI Quality Regression Detected',
    text: `Rolling average score: ${rollingAvg.toFixed(3)} → Latest score: ${latestScore.toFixed(3)}`,
    detail: `Score dropped by ${(drop * 100).toFixed(1)}% (threshold: ${user.alertConfig.thresholdDrop * 100}%)`,
    window: `Based on last ${windowSize} evaluations`,
  };
}

async function sendSlackAlert(webhookUrl, message) {
  await axios.post(webhookUrl, {
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: message.title },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${message.text}*\n${message.detail}\n_${message.window}_` },
      },
    ],
  });
}

async function sendEmailAlert(to, message, name) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `AI Observability Platform <${process.env.SMTP_USER}>`,
    to,
    subject: message.title,
    html: `
      <h2>${message.title}</h2>
      <p><strong>${message.text}</strong></p>
      <p>${message.detail}</p>
      <p><em>${message.window}</em></p>
    `,
  });
}

module.exports = { checkForRegression };