// lib/analytics.ts

// 声明全局 gtag 函数
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// 1. 页面访问上报
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag && GA_TRACKING_ID) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// 2. 自定义商业行为事件埋点
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// 快捷预设事件
export const analytics = {
  // 点击订阅会员
  clickSubscribe: (tier = "pro") =>
    trackEvent({ action: "click_subscribe", category: "Monetization", label: tier }),
  // 点击微信导师咨询
  clickConsultation: (serviceName: string) =>
    trackEvent({ action: "click_consultation", category: "Services", label: serviceName }),
  // 开始做题
  startProblem: (problemTitle: string) =>
    trackEvent({ action: "view_problem", category: "Engagement", label: problemTitle }),
};