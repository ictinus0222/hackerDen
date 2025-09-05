/**
 * @fileoverview Custom Tooltip Component with Personality
 * Enhanced shadcn/ui Tooltip with witty content and pop-culture references
 */

import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import botService from '../services/botService';

// Witty tooltip content organized by element type
const WITTY_TOOLTIPS = {
  task_card: [
    "This task is ready for action! 🎯",
    "Click me! I won't bite... much 😄",
    "I'm just a humble task, waiting to be completed 📝",
    "Ready to make some progress? Let's go! 🚀",
    "May the force be with you on this task! ⭐",
    "This task has chosen you, Harry! ⚡",
    "With great power comes great responsibility... to complete this task! 🕷️",
    "I find your lack of task completion disturbing... 🖤",
    "One does not simply ignore this task! 💍"
  ],
  
  delete_button: [
    "Are you sure? I had such potential! 😢",
    "Delete me if you must, but I'll be back! 👻",
    "This is the end... my only friend, the end 🎭",
    "To delete or not to delete, that is the question 🤔",
    "I don't feel so good... 💫",
    "Delete? But we were just getting started! 💔",
    "Hasta la vista, baby! 🤖",
    "Why so serious? Let's put a smile on that delete! 🃏"
  ],
  
  file_upload: [
    "Drop it like it's hot! 🔥",
    "Files welcome! No judgment here 📁",
    "Drag, drop, and let the magic happen ✨",
    "Your files are safe with me! 🛡️",
    "I am inevitable... for your file uploads! 💎",
    "With great files comes great organization! 🕸️",
    "These aren't the files you're looking for... or are they? 🤖",
    "File upload is the way! 🛡️"
  ],
  
  vote_button: [
    "Democracy in action! Your vote matters! 🗳️",
    "Click to make your voice heard! 📢",
    "Every vote counts in this digital democracy! 🏛️",
    "Be the change you want to see! ✊",
    "The power is yours! 💪",
    "Choose wisely, young padawan! ⚔️",
    "With great voting power... you know the rest! 🕷️",
    "Vote or die! (Metaphorically speaking) 🗳️"
  ],
  
  save_button: [
    "Save the day! 🦸‍♂️",
    "Ctrl+S is for quitters, click me instead! 💾",
    "Your progress is precious, save it! 💎",
    "Save early, save often! 🔄",
    "I'll be back... to save your work! 🤖",
    "Saving Private Progress! 🎖️",
    "Save me, Obi-Wan Kenobi! ⭐",
    "To save or not to save... always save! 💾"
  ],
  
  chat_input: [
    "Say something! Anything! 💬",
    "Your team awaits your wisdom! 🧙‍♂️",
    "Type like the wind! 💨",
    "Communication is key! 🗝️",
    "Use the force... to type! ⚡",
    "I have a bad feeling about this silence... 🤐",
    "Say hello to my little friend... the keyboard! ⌨️",
    "You talking to me? Please do! 🗣️"
  ],
  
  kanban_column: [
    "Drag tasks here like a boss! 👑",
    "This column is your destiny! ⭐",
    "Tasks belong here, young grasshopper! 🦗",
    "Welcome to the column of dreams! 🌟",
    "I am the column your tasks are looking for! 🤖",
    "This is where the magic happens! ✨",
    "Column sweet column! 🏠",
    "May the column be with you! ⚔️"
  ],
  
  settings_button: [
    "Customize your experience! ⚙️",
    "Settings: where dreams come true! 🌟",
    "Tweak me, baby! 🔧",
    "Make it your own! 🎨",
    "I love it when a plan comes together... in settings! 📋",
    "Settings: the final frontier! 🚀",
    "Resistance is futile... configure me! 🤖",
    "Show me what you got! 💪"
  ],
  
  notification_bell: [
    "Ring ring! You've got notifications! 🔔",
    "Don't ignore me! I have news! 📰",
    "Ding dong! Notification calling! 🛎️",
    "I'm not just a bell, I'm THE bell! 🔔",
    "For whom the bell tolls... it tolls for thee! ⏰",
    "Notification station! All aboard! 🚂",
    "I'll be back... with more notifications! 🤖",
    "You've got mail! Wait, wrong notification... 📧"
  ],
  
  profile_avatar: [
    "Looking good! 😎",
    "That's you! In all your glory! ⭐",
    "Profile pic perfection! 📸",
    "You're the star of this show! 🌟",
    "I see you! 👁️",
    "Mirror mirror on the wall... 🪞",
    "You're breathtaking! 🌬️",
    "That's what I call a profile! 👤"
  ],
  
  search_input: [
    "Seek and ye shall find! 🔍",
    "What are you looking for? 🕵️‍♂️",
    "Search your feelings... and this input! 💭",
    "The truth is out there... in your search! 🛸",
    "I find your lack of search disturbing... 🖤",
    "Search me! (Literally) 🔍",
    "To search or not to search... always search! 🔎",
    "May the search be with you! ⚔️"
  ]
};

// Pop culture reference tooltips for special occasions
const POP_CULTURE_TOOLTIPS = {
  star_wars: [
    "These aren't the droids you're looking for... 🤖",
    "May the force be with you! ⚔️",
    "I find your lack of faith disturbing... 🖤",
    "Do or do not, there is no try! 🐸",
    "That's no moon... it's a space station! 🌙",
    "Help me, Obi-Wan Kenobi! ⭐",
    "I have a bad feeling about this... 😰",
    "The force is strong with this one! 💪"
  ],
  
  marvel: [
    "With great power comes great responsibility! 🕷️",
    "I am inevitable! 💎",
    "I can do this all day! 🛡️",
    "I don't feel so good... 💫",
    "Avengers... assemble! 🦸‍♂️",
    "I am Iron Man! 🤖",
    "Hulk smash! 💚",
    "Wakanda forever! 🖤"
  ],
  
  movies: [
    "I'll be back! 🤖",
    "Here's looking at you, kid! 👁️",
    "Show me the money! 💰",
    "You talking to me? 🗣️",
    "Hasta la vista, baby! 👋",
    "Why so serious? 🃏",
    "I love the smell of code in the morning! ☕",
    "Say hello to my little friend! 👋"
  ],
  
  gaming: [
    "It's dangerous to go alone! Take this! ⚔️",
    "The cake is a lie! 🎂",
    "Would you kindly... click this? 🎮",
    "A winner is you! 🏆",
    "All your base are belong to us! 👾",
    "Press F to pay respects! ⌨️",
    "Git gud! 🎯",
    "Achievement unlocked! 🏅"
  ],
  
  memes: [
    "Such tooltip, much wow! 🐕",
    "This is fine... 🔥",
    "One does not simply... ignore this tooltip! 💍",
    "Distracted boyfriend meme but it's you and this tooltip! 👀",
    "Drake pointing at this tooltip! 👉",
    "Change my mind... about not clicking this! 🪑",
    "Is this a pigeon? No, it's a tooltip! 🦋",
    "Stonks! 📈"
  ]
};

// Time-based tooltip variations
const TIME_BASED_TOOLTIPS = {
  morning: [
    "Good morning, sunshine! ☀️",
    "Rise and grind! ⏰",
    "Coffee first, then tooltip! ☕",
    "Early bird gets the tooltip! 🐦"
  ],
  
  afternoon: [
    "Good afternoon! 🌤️",
    "Lunch break tooltip! 🍽️",
    "Afternoon delight... tooltip style! 😎",
    "Mid-day motivation! 💪"
  ],
  
  evening: [
    "Good evening! 🌅",
    "Dinner time tooltip! 🍽️",
    "Evening vibes! 🌆",
    "Sunset tooltip! 🌇"
  ],
  
  night: [
    "Burning the midnight oil? 🕯️",
    "Night owl tooltip! 🦉",
    "Late night coding session! 💻",
    "Sweet dreams are made of tooltips! 😴"
  ]
};

// Get random tooltip from array
const getRandomTooltip = (tooltips) => {
  return tooltips[Math.floor(Math.random() * tooltips.length)];
};

// Get time-based greeting
const getTimeBasedTooltip = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return getRandomTooltip(TIME_BASED_TOOLTIPS.morning);
  } else if (hour >= 12 && hour < 17) {
    return getRandomTooltip(TIME_BASED_TOOLTIPS.afternoon);
  } else if (hour >= 17 && hour < 21) {
    return getRandomTooltip(TIME_BASED_TOOLTIPS.evening);
  } else {
    return getRandomTooltip(TIME_BASED_TOOLTIPS.night);
  }
};

// Get pop culture tooltip based on random selection
const getPopCultureTooltip = () => {
  const categories = Object.keys(POP_CULTURE_TOOLTIPS);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return getRandomTooltip(POP_CULTURE_TOOLTIPS[randomCategory]);
};

/**
 * Custom Tooltip Component with Personality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Trigger element
 * @param {string} props.content - Custom tooltip content (overrides automatic content)
 * @param {string} props.type - Element type for automatic witty content
 * @param {boolean} props.witty - Enable witty mode (default: true)
 * @param {boolean} props.popCulture - Enable pop culture references (default: false)
 * @param {boolean} props.timeBased - Enable time-based greetings (default: false)
 * @param {number} props.delay - Delay before showing tooltip (default: 500ms)
 * @param {string} props.side - Tooltip position (default: 'top')
 * @param {Object} props.tooltipProps - Additional props for TooltipContent
 */
export const CustomTooltip = ({
  children,
  content,
  type,
  witty = true,
  popCulture = false,
  timeBased = false,
  delay = 500,
  side = 'top',
  tooltipProps = {},
  ...props
}) => {
  const [tooltipContent, setTooltipContent] = useState(content);
  const [isVisible, setIsVisible] = useState(false);

  // Generate dynamic tooltip content
  useEffect(() => {
    if (content) {
      setTooltipContent(content);
      return;
    }

    let dynamicContent = '';

    // Priority order: time-based > pop culture > witty > type-based > fallback
    if (timeBased) {
      dynamicContent = getTimeBasedTooltip();
    } else if (popCulture && Math.random() < 0.3) { // 30% chance for pop culture
      dynamicContent = getPopCultureTooltip();
    } else if (witty && type && WITTY_TOOLTIPS[type]) {
      dynamicContent = getRandomTooltip(WITTY_TOOLTIPS[type]);
    } else if (type && WITTY_TOOLTIPS[type]) {
      dynamicContent = getRandomTooltip(WITTY_TOOLTIPS[type]);
    } else {
      // Fallback to bot service witty tooltip
      dynamicContent = botService.getWittyTooltip(type || 'default');
    }

    setTooltipContent(dynamicContent);
  }, [content, type, witty, popCulture, timeBased]);

  // Handle tooltip visibility for analytics (optional)
  const handleTooltipShow = () => {
    setIsVisible(true);
    // Could track tooltip interactions here
  };

  const handleTooltipHide = () => {
    setIsVisible(false);
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={delay} {...props}>
        <TooltipTrigger asChild onMouseEnter={handleTooltipShow} onMouseLeave={handleTooltipHide}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} {...tooltipProps}>
          <span className="text-sm">{tooltipContent}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Specialized tooltip variants for common use cases
 */

// Witty tooltip for task cards
export const TaskTooltip = ({ children, ...props }) => (
  <CustomTooltip type="task_card" witty={true} {...props}>
    {children}
  </CustomTooltip>
);

// Pop culture tooltip for fun elements
export const PopCultureTooltip = ({ children, ...props }) => (
  <CustomTooltip popCulture={true} witty={true} {...props}>
    {children}
  </CustomTooltip>
);

// Time-based greeting tooltip
export const GreetingTooltip = ({ children, ...props }) => (
  <CustomTooltip timeBased={true} witty={true} {...props}>
    {children}
  </CustomTooltip>
);

// Delete button with dramatic tooltip
export const DeleteTooltip = ({ children, ...props }) => (
  <CustomTooltip type="delete_button" witty={true} popCulture={true} {...props}>
    {children}
  </CustomTooltip>
);

// File upload tooltip
export const FileUploadTooltip = ({ children, ...props }) => (
  <CustomTooltip type="file_upload" witty={true} {...props}>
    {children}
  </CustomTooltip>
);

// Vote button tooltip
export const VoteTooltip = ({ children, ...props }) => (
  <CustomTooltip type="vote_button" witty={true} popCulture={true} {...props}>
    {children}
  </CustomTooltip>
);

// Chat input tooltip
export const ChatTooltip = ({ children, ...props }) => (
  <CustomTooltip type="chat_input" witty={true} timeBased={true} {...props}>
    {children}
  </CustomTooltip>
);

// Settings tooltip
export const SettingsTooltip = ({ children, ...props }) => (
  <CustomTooltip type="settings_button" witty={true} {...props}>
    {children}
  </CustomTooltip>
);

export default CustomTooltip;