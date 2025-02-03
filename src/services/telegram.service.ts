import { formatDate } from '../utils/dateUtils';
import type { Task } from '../types';
import type { Announcement } from '../types/announcement';

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_WORKING9_CHAT_ID; // 🔹 Use specific WORKING9 group chat ID
const TELEGRAM_API = TELEGRAM_BOT_TOKEN ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}` : '';
const APP_DOMAIN = 'https://nesttask.vercel.app';

export async function sendTelegramMessage(text: string, photo?: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("❌ Telegram bot token or chat ID is missing.");
    return false;
  }

  try {
    const endpoint = photo ? "/sendPhoto" : "/sendMessage";
    const body = photo
      ? { chat_id: TELEGRAM_CHAT_ID, photo, caption: text, parse_mode: 'HTML' }
      : { chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: false };

    const response = await fetch(`${TELEGRAM_API}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to send Telegram ${photo ? "photo" : "message"}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error sending Telegram notification:', error);
    return false;
  }
}

// Get status emoji
const getStatusEmoji = (status: string) => {
  switch (status) {
    case 'completed': return '✅';
    case 'in-progress': return '⏳';
    default: return '📝';
  }
};

// Get category emoji
const getCategoryEmoji = (category: string) => {
  switch (category) {
    case 'presentation': return '🎯';
    case 'assignment': return '📚';
    case 'quiz': return '📖';
    case 'lab-report': return '🔬';
    case 'lab-final': return '🧪';
    case 'documents': return '📄';
    case 'blc': return '🏢';
    case 'groups': return '👥';
    default: return '📋';
  }
};

export async function sendTaskNotification(task: Task) {
  const fileUrls = task.description.match(/\[.*?\]\((.*?)\)/g)?.map(match => {
    const [, url] = match.match(/\[.*?\]\((.*?)\)/) || [];
    return url;
  }) || [];

  const imageUrl = fileUrls.find(url => url?.match(/\.(jpg|jpeg|png|gif|webp)$/i));

  const fileSection = fileUrls.length 
    ? `\n\n📎 <b>Attachments:</b>\n${fileUrls.map((url, i) => 
        `${i + 1}. <a href="${url}">View File ${i + 1}</a>`
      ).join('\n')}`
    : '';

  const processDescription = (text: string) => 
    text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>').replace(/\n/g, '\n');

  const message = `
🔔 <b>New ${task.isAdminTask ? 'Admin ' : ''}Task Alert!</b>

${getCategoryEmoji(task.category)} <b>${task.name}</b>
${getStatusEmoji(task.status)} Status: ${task.status === 'my-tasks' ? 'To Do' : task.status === 'in-progress' ? 'In Progress' : 'Completed'}

📝 <b>Description:</b>
${processDescription(task.description)}

🏷️ Category: #${task.category}
📅 Due Date: ${formatDate(new Date(task.dueDate), 'MMMM d, yyyy')}
⏰ Created: ${formatDate(new Date(task.createdAt), 'MMMM d, yyyy HH:mm')}
${task.isAdminTask ? '👑 <b>Admin Task</b>' : ''}

🔗 <b>View full details:</b>
• ${APP_DOMAIN}

#NestTask #${task.category} ${task.isAdminTask ? '#AdminTask' : ''} #Task
${task.isAdminTask ? '\n⚡️ Stay updated with NestTask!' : ''}`;

  return sendTelegramMessage(message, imageUrl);
}

export async function sendAnnouncementNotification(announcement: Announcement) {
  const imageUrl = announcement.content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i)?.[0];

  const message = `
📢 <b>Important Announcement</b>

🔔 <b>${announcement.title}</b>

${announcement.content}


🔗 <b>View full details:</b>
• ${APP_DOMAIN}


⚡️ Stay updated with NestTask!`;

  return sendTelegramMessage(message, imageUrl);
}
