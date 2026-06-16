"use client";

import { useState, useEffect, useRef } from "react";
import { motivos, Category } from "@/lib/motivos";
import { 
  Heart, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  MessageSquare, 
  Users, 
  Camera, 
  Send, 
  Download, 
  Search, 
  X, 
  Sparkles, 
  Bookmark, 
  ArrowRight,
  RefreshCw,
  Lock,
  Bell,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [category, setCategory] = useState<Category>("h-m");
  const [diaAtual, setDiaAtual] = useState(1);
  const [dataAtual, setDataAtual] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dayInput, setDayInput] = useState("");
  const [favorites, setFavorites] = useState<Record<string, number[]>>({
    "h-m": [],
    "m-h": [],
    "amor-proprio": []
  });
  
  // Card Share Modal States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareFormat, setShareFormat] = useState<"post" | "story">("post");
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Swipe Gestures for Mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Exclusive Access Gate States
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [showGateError, setShowGateError] = useState(false);

  // Horizontal Card Transitions
  const [isChanging, setIsChanging] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  // Anniversary Start Date counter
  const [isSpecialDateMode, setIsSpecialDateMode] = useState(false);
  const [specialStartDate, setSpecialStartDate] = useState("");

  // Daily Local Push Reminders
  const [reminderEnabled, setReminderEnabled] = useState(false);

  // Card Design Customizations
  const [cardTheme, setCardTheme] = useState<"category" | "alternate" | "minimal">("category");
  const [showWatermark, setShowWatermark] = useState(true);
  const [textColorMode, setTextColorMode] = useState<"white" | "gold" | "rose">("white");

  // Helper variables for checking Web Share availability in window context safely
  const isWebShareSupported = typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const changeDayWithTransition = (targetDay: number, direction: "left" | "right") => {
    if (targetDay === diaAtual) return;
    setSlideDirection(direction);
    setIsChanging(true);
    setTimeout(() => {
      setDiaAtual(targetDay);
      setIsChanging(false);
    }, 200); // Wait for exit animation to complete
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    
    // Swipe left (distance > 50) -> next motive
    // Swipe right (distance < -50) -> previous motive
    if (distance > 50 && diaAtual < motivos[category].length) {
      changeDayWithTransition(diaAtual + 1, "right");
    } else if (distance < -50 && diaAtual > 1) {
      changeDayWithTransition(diaAtual - 1, "left");
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Load persistent configurations on mount
  useEffect(() => {
    // 1. Access Code Lock check
    const unlocked = localStorage.getItem("motivos_unlocked");
    setIsUnlocked(unlocked === "true");

    // 2. Anniversary Date mode
    const savedSpecialMode = localStorage.getItem("motivos_special_mode");
    const savedStartDate = localStorage.getItem("motivos_special_start_date");
    if (savedSpecialMode === "true" && savedStartDate) {
      setIsSpecialDateMode(true);
      setSpecialStartDate(savedStartDate);
    }

    // 3. Local Push Reminder status
    const savedReminder = localStorage.getItem("motivos_reminder_enabled");
    if (savedReminder === "true" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setReminderEnabled(true);
      } else {
        localStorage.removeItem("motivos_reminder_enabled");
      }
    }
  }, []);

  // Calculate active day based on date configurations
  useEffect(() => {
    if (isSpecialDateMode && specialStartDate) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const start = new Date(specialStartDate);
      start.setHours(0, 0, 0, 0);
      
      const diffTime = hoje.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0) {
        const calculatedDay = (diffDays % 365) + 1;
        setDiaAtual(Math.min(calculatedDay, motivos[category].length));
      } else {
        setDiaAtual(1); // default if date is in the future
      }
    } else {
      const hoje = new Date();
      const diaAno = Math.floor(
        (hoje.getTime() - new Date(hoje.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
      );
      setDiaAtual(Math.min(diaAno, motivos[category].length));
    }
  }, [category, isSpecialDateMode, specialStartDate]);

  // Load favorites
  useEffect(() => {
    const savedFavs = localStorage.getItem("motivos_favs");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Update calendar date string
  useEffect(() => {
    const hoje = new Date();
    setDataAtual(
      hoje.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  // Register Service Worker for PWA offline capabilities
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Service Worker registered successfully:", reg.scope))
          .catch((err) => console.error("Service Worker registration failed:", err));
      });
    }
  }, []);

  const motivosCategoria = motivos[category];
  const motivo = motivosCategoria[diaAtual - 1] || "";

  // Handle favoriting
  const toggleFavorite = () => {
    const list = favorites[category];
    const index = diaAtual - 1;
    let newList: number[];
    
    if (list.includes(index)) {
      newList = list.filter(i => i !== index);
    } else {
      newList = [...list, index].sort((a, b) => a - b);
    }
    
    const newFavorites = {
      ...favorites,
      [category]: newList
    };
    
    setFavorites(newFavorites);
    localStorage.setItem("motivos_favs", JSON.stringify(newFavorites));
  };

  const isFavorited = favorites[category].includes(diaAtual - 1);

  // Standard Text Sharing helpers
  const getShareText = () => {
    return `Dia ${diaAtual}: ${motivo} ❤️\n\n365 Motivos para Te Amar`;
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShareText());
    alert("Copiado com sucesso! ❤️");
  };

  // Navigation handlers
  const proximoDia = () => {
    if (diaAtual < motivosCategoria.length) {
      changeDayWithTransition(diaAtual + 1, "right");
    }
  };

  const diaAnterior = () => {
    if (diaAtual > 1) {
      changeDayWithTransition(diaAtual - 1, "left");
    }
  };

  const handleJumpToDay = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(dayInput, 10);
    if (!isNaN(target) && target >= 1 && target <= motivosCategoria.length) {
      changeDayWithTransition(target, target > diaAtual ? "right" : "left");
      setDayInput("");
    }
  };

  const handleUnlockGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCodeInput.trim().toUpperCase() === "USU01210#LOVE") {
      setIsUnlocked(true);
      localStorage.setItem("motivos_unlocked", "true");
    } else {
      setShowGateError(true);
    }
  };

  const toggleReminder = async () => {
    if (reminderEnabled) {
      setReminderEnabled(false);
      localStorage.removeItem("motivos_reminder_enabled");
      return;
    }

    if (!("Notification" in window)) {
      alert("Seu navegador não suporta notificações locais.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setReminderEnabled(true);
      localStorage.setItem("motivos_reminder_enabled", "true");
      triggerTestNotification();
    } else {
      alert("Permissão de notificação negada. Ative as permissões nas configurações do navegador.");
    }
  };

  const triggerTestNotification = async () => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    
    const bodyText = `Seu lembrete diário do 365 Motivos foi ativado com sucesso! ❤️`;
    
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification("365 Motivos Para Te Amar", {
        body: bodyText,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [100, 50, 100],
        data: { url: "/" }
      } as any);
    } else {
      new Notification("365 Motivos Para Te Amar", {
        body: bodyText,
        icon: "/icon-192.png"
      });
    }
  };

  const shareNativeImage = async () => {
    if (!previewImage) return;

    try {
      const response = await fetch(previewImage);
      const blob = await response.blob();
      const file = new File([blob], `365-motivos-dia-${diaAtual}-${shareFormat}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Dia ${diaAtual} - 365 Motivos`,
          text: `Dia ${diaAtual}: ${motivo} ❤️`
        });
      } else {
        downloadCard();
      }
    } catch (e) {
      console.error("Web Share failed, fallback to download:", e);
      downloadCard();
    }
  };

  // Helper labels
  const getCategoryLabel = (cat: Category) => {
    switch (cat) {
      case "h-m": return "Ele → Ela";
      case "m-h": return "Ela → Ele";
      case "amor-proprio": return "Amor Próprio";
    }
  };

  // Canvas drawing logic for social card sharing - highly refined and mobile legible
  const generateSocialCard = async (format: "post" | "story") => {
    setIsGenerating(true);
    // Give state time to update
    await new Promise((resolve) => setTimeout(resolve, 150));
    
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGenerating(false);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    // Set high-resolution dimensions
    const width = 1080;
    const height = format === "post" ? 1080 : 1920;
    canvas.width = width;
    canvas.height = height;

    const isAP = category === "amor-proprio";

    // 1. Preload luxury typography fonts to prevent unstyled fallbacks on canvas
    try {
      await document.fonts.load("italic 40px 'Playfair Display'");
      await document.fonts.load("bold 24px 'Plus Jakarta Sans'");
    } catch (e) {
      console.warn("Could not preload fonts dynamically:", e);
    }

    // 2. Select background photo URL based on designer theme
    let bgUrl = "";
    if (cardTheme === "category") {
      bgUrl = isAP
        ? "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1080&auto=format&fit=crop"
        : "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1080&auto=format&fit=crop";
    } else if (cardTheme === "alternate") {
      bgUrl = isAP
        ? "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1080&auto=format&fit=crop" // Serene nature
        : "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1080&auto=format&fit=crop"; // Hugging romantic couple
    }

    // Set dynamic text color modes (white, champagne, rose gold)
    let textHex = "#ffffff";
    let accentHex = isAP ? "#d8b4fe" : "#f1d4cb"; 
    let iconHex = isAP ? "#c084fc" : "#e2a89a"; 

    if (textColorMode === "gold") {
      textHex = "#fff2cc"; // Champagne gold
      accentHex = "#d4af37";
      iconHex = "#aa8412";
    } else if (textColorMode === "rose") {
      textHex = "#fcece7"; // Rose gold
      accentHex = "#e2a89a";
      iconHex = "#c58677";
    }

    // Render backdrop (image cover fit or solid gradients)
    if (cardTheme !== "minimal" && bgUrl) {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = bgUrl;
      
      await new Promise((resolve) => {
        bgImg.onload = resolve;
        bgImg.onerror = resolve; // Continue even if load fails
      });

      if (bgImg.complete && bgImg.naturalWidth > 0) {
        const imgRatio = bgImg.width / bgImg.height;
        const canvasRatio = width / height;
        let dWidth = width;
        let dHeight = height;
        let dx = 0;
        let dy = 0;
        
        if (imgRatio > canvasRatio) {
          dWidth = height * imgRatio;
          dx = (width - dWidth) / 2;
        } else {
          dHeight = width / imgRatio;
          dy = (height - dHeight) / 2;
        }
        ctx.drawImage(bgImg, dx, dy, dWidth, dHeight);
        
        // Dark semi-transparent velvet mask overlay
        ctx.fillStyle = isAP ? "rgba(11, 2, 21, 0.88)" : "rgba(18, 1, 6, 0.88)";
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      // Solid velvet gradient layout fallback
      const bgGrad = ctx.createRadialGradient(
        width / 2, 
        height / 2, 
        100, 
        width / 2, 
        height / 2, 
        Math.max(width, height) / 1.1
      );
      if (isAP) {
        bgGrad.addColorStop(0, "#1f0b3b"); 
        bgGrad.addColorStop(0.5, "#0d041a");
        bgGrad.addColorStop(1, "#04010a"); 
      } else {
        bgGrad.addColorStop(0, "#50061b"); 
        bgGrad.addColorStop(0.5, "#22020b");
        bgGrad.addColorStop(1, "#0a0003"); 
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Smooth ambient lighting overlay
    const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.75);
    glow.addColorStop(0, isAP ? "rgba(168, 85, 247, 0.18)" : "rgba(226, 168, 154, 0.15)");
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // 3. Central Glassmorphic Card Container
    const cardX = 80;
    const cardY = format === "post" ? 80 : 220;
    const cardW = width - cardX * 2; 
    const cardH = format === "post" ? 920 : 1480; 
    const cardRadius = 36;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cardX + cardRadius, cardY);
    ctx.lineTo(cardX + cardW - cardRadius, cardY);
    ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + cardRadius);
    ctx.lineTo(cardX + cardW, cardY + cardH - cardRadius);
    ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - cardRadius, cardY + cardH);
    ctx.lineTo(cardX + cardRadius, cardY + cardH);
    ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - cardRadius);
    ctx.lineTo(cardX, cardY + cardRadius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + cardRadius, cardY);
    ctx.closePath();

    ctx.fillStyle = "rgba(10, 2, 5, 0.65)";
    ctx.fill();

    ctx.strokeStyle = isAP ? "rgba(192, 132, 252, 0.25)" : "rgba(226, 168, 154, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // High-contrast gold/lavender highlighted top reflection line accent
    ctx.strokeStyle = isAP ? "rgba(192, 132, 252, 0.45)" : "rgba(226, 168, 154, 0.45)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cardX + cardRadius, cardY);
    ctx.lineTo(cardX + cardW - cardRadius, cardY);
    ctx.stroke();

    // 4. Header category tag label
    ctx.fillStyle = accentHex;
    ctx.font = "bold 22px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const headerLabel = isAP ? "AMOR PRÓPRIO" : "365 MOTIVOS PARA TE AMAR";
    ctx.fillText(headerLabel, width / 2, cardY + 70);

    // 5. Day display - stylized and larger
    ctx.fillStyle = textHex;
    ctx.font = "italic bold 96px 'Playfair Display', Georgia, serif";
    ctx.fillText(`Dia ${diaAtual}`, width / 2, cardY + 185);

    // 6. Elegant divider line with heart symbol
    const divY = cardY + 265;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cardX + 160, divY);
    ctx.lineTo(width / 2 - 30, divY);
    ctx.moveTo(width / 2 + 30, divY);
    ctx.lineTo(cardX + cardW - 160, divY);
    ctx.stroke();

    // Heart icon drawn in center of divider
    ctx.fillStyle = iconHex;
    const hX = width / 2;
    const hY = divY - 7;
    ctx.beginPath();
    ctx.arc(hX - 5, hY, 5, 0, Math.PI * 2);
    ctx.arc(hX + 5, hY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hX - 10, hY + 1.5);
    ctx.lineTo(hX, hY + 11);
    ctx.lineTo(hX + 10, hY + 1.5);
    ctx.closePath();
    ctx.fill();

    // 7. Motive text - wrapped and vertically balanced
    ctx.fillStyle = textHex;
    
    // Dynamic text size based on character count
    let fontSize = 48; // default large font
    if (motivo.length > 160) {
      fontSize = 38;  // long text
    } else if (motivo.length < 80) {
      fontSize = 58;  // short punchy quote
    }

    const maxTextWidth = cardW - 160; // 760px wrap width
    const lineHeight = fontSize * 1.5;
    ctx.font = `italic ${fontSize}px 'Playfair Display', Georgia, serif`;

    // Wrap text lines
    const words = motivo.split(" ");
    let line = "";
    const lines: string[] = [];
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Align and draw lines centered vertically in text bounding box
    const textStartY = cardY + 310;
    const textEndY = cardY + cardH - 110;
    const availableHeight = textEndY - textStartY;
    const totalTextHeight = lines.length * lineHeight;
    
    let currentY = textStartY + (availableHeight - totalTextHeight) / 2 + (lineHeight / 2);
    
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], width / 2, currentY);
      currentY += lineHeight;
    }

    // Draw elegant centered quote marks wrapping the text block
    ctx.fillStyle = textColorMode === "white" 
      ? (isAP ? "rgba(192, 132, 252, 0.45)" : "rgba(226, 168, 154, 0.45)")
      : (textColorMode === "gold" ? "rgba(212, 175, 55, 0.35)" : "rgba(226, 168, 154, 0.35)");
    ctx.font = "bold 60px Georgia, serif";
    ctx.textAlign = "center";
    
    const textTopY = textStartY + (availableHeight - totalTextHeight) / 2;
    ctx.fillText("“", width / 2, textTopY - 20);
    ctx.fillText("”", width / 2, textTopY + totalTextHeight + 40);

    // 8. Card Footer (watermark)
    if (showWatermark) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "bold 18px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("365MOTIVOS.COM", width / 2, cardY + cardH - 50);
    }

    // Decorative graphics for vertical Story template
    if (format === "story") {
      ctx.fillStyle = isAP ? "rgba(192, 132, 252, 0.4)" : "rgba(226, 168, 154, 0.4)";
      ctx.font = "52px 'Playfair Display', Georgia, serif";
      ctx.fillText("❤️", width / 2, height - 140);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "22px 'Plus Jakarta Sans', system-ui, sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("Cultive o Amor Diariamente", width / 2, height - 90);
    }

    // Export generated canvas to display preview
    try {
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewImage(dataUrl);
    } catch (e) {
      console.error("Canvas export failed:", e);
    }
    
    setIsGenerating(false);
  };

  // Redraw card preview when modal states or customization settings alter
  useEffect(() => {
    if (isShareModalOpen) {
      generateSocialCard(shareFormat);
    }
  }, [isShareModalOpen, shareFormat, diaAtual, category, cardTheme, showWatermark, textColorMode]);

  // Handle PNG download action
  const downloadCard = () => {
    if (!previewImage) return;
    const link = document.createElement("a");
    link.download = `365-motivos-dia-${diaAtual}-${shareFormat}.png`;
    link.href = previewImage;
    link.click();
  };

  const favoritedList = favorites[category];
  const totalFavorites = favoritedList.length;

  if (isUnlocked === null) {
    // Return loading state briefly to prevent flash of lock gate on page refresh
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0205]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#e2a89a]" />
          <p className="text-xs font-light text-white/45 tracking-widest uppercase">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden bg-[#0b0205] flex items-center justify-center p-4">
        {/* Same beautiful background image & mask overlay as screen */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 20% 20%, rgba(226, 168, 154, 0.12) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(244, 63, 94, 0.1) 0%, transparent 60%), linear-gradient(to bottom right, #070002, #3e0514, #070002)"
            }}
          />
        </div>
        
        {/* Exclusive Gate Frosted Container */}
        <div className="relative z-10 w-full max-w-md glass-premium rounded-[32px] p-8 md:p-10 text-center border shadow-2xl flex flex-col items-center gap-6"
             style={{ borderColor: "rgba(226, 168, 154, 0.25)", boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1.5px 0 rgba(226, 168, 154, 0.25)" }}>
          <div className="w-14 h-14 rounded-2xl bg-[#e2a89a]/10 border border-[#e2a89a]/30 flex items-center justify-center animate-premium-pulse">
            <Heart className="w-7 h-7 text-rose-gold-metallic" />
          </div>
          
          <div>
            <h2 className="text-2xl font-serif-elegant font-bold text-white tracking-wide">Acesso Exclusivo</h2>
            <p className="text-xs font-light text-white/60 leading-relaxed mt-2.5 px-3">
              Este é um portal privado feito com amor. Por favor, insira o seu código pessoal para acessar os motivos diários.
            </p>
          </div>
          
          <form onSubmit={handleUnlockGate} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] text-white/45 uppercase tracking-widest font-semibold">Código de Acesso</label>
              <input 
                type="text"
                value={accessCodeInput}
                onChange={(e) => {
                  setAccessCodeInput(e.target.value);
                  setShowGateError(false);
                }}
                placeholder="Ex: USU00000#LOVE"
                className={cn(
                  "w-full bg-white/5 border rounded-xl px-4 py-3.5 text-sm text-center font-bold tracking-widest text-white placeholder-white/20 focus:outline-none focus:border-rose-gold transition-all duration-300",
                  showGateError ? "border-red-500/50 focus:border-red-500 animate-shake" : "border-white/10"
                )}
              />
            </div>
            
            {showGateError && (
              <p className="text-red-400 text-xs font-light">Código incorreto ou inválido. Tente novamente.</p>
            )}
            
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#e2a89a] to-[#f43f5e] hover:brightness-105 active:scale-95 text-rose-950 font-bold text-sm tracking-widest uppercase transition-all shadow-lg mt-2"
            >
              Acessar Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#0b0205] select-none">
      
      {/* Dynamic Background Image & Color Mask */}
      <div className="absolute inset-0 z-0">
        <img 
          src={
            category === "amor-proprio"
              ? "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2000&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2000&auto=format&fit=crop"
          }
          alt="Premium backdrop"
          className="w-full h-full object-cover transition-opacity duration-[1500ms]"
          style={{ opacity: 0.16 }}
        />
        
        {/* Aesthetic Velvet Overlay with Smooth Ambient Radial Glows (No sharp circles!) */}
        <div 
          className="absolute inset-0 transition-all duration-[1500ms]"
          style={{
            background: category === "amor-proprio"
              ? "radial-gradient(circle at 20% 20%, rgba(168, 85, 247, 0.18) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.14) 0%, transparent 60%), linear-gradient(to bottom right, #0b0314, #19082c, #030107)"
              : "radial-gradient(circle at 20% 20%, rgba(226, 168, 154, 0.18) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(244, 63, 94, 0.14) 0%, transparent 60%), linear-gradient(to bottom right, #070002, #3e0514, #070002)"
          }}
        />
      </div>

      {/* Content wrapper - optimized responsiveness */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between items-center p-3 xs:p-4 sm:p-8 md:p-12 font-sans-elegant">
        
        {/* 1. Header Bar */}
        <header className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-5 mb-6 md:mb-8 mt-2">
          {/* Logo Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl glass-premium flex items-center justify-center border-rose-gold shadow-lg">
              <Heart className="w-5 h-5 text-rose-gold-metallic animate-premium-pulse" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-serif-elegant font-bold tracking-wider text-rose-gold-metallic">
                365 Motivos
              </h1>
              <p className="text-[9px] tracking-[0.25em] text-white/35 uppercase">Para Cultivar</p>
            </div>
          </div>

          {/* Category Tabs Selection */}
          <div className="flex flex-wrap justify-center bg-black/45 backdrop-blur-lg p-1 rounded-2xl border border-white/5 shadow-2xl">
            {(["h-m", "m-h", "amor-proprio"] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setSearchQuery("");
                }}
                className={cn(
                  "px-4 xs:px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300",
                  category === cat
                    ? "bg-white/95 text-rose-950 shadow-xl scale-100"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </header>

        {/* 2. Interactive Body Grid */}
        <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 my-auto items-center">
          
          {/* Daily Card Content - Displays first on Mobile */}
          <div className="lg:col-span-8 w-full order-1">
            
            {/* Search Results Screen Overlay */}
            {searchQuery ? (
              <div 
                className="glass-premium p-6 sm:p-8 rounded-[28px] border w-full min-h-[420px] flex flex-col text-left transition-all duration-500"
                style={{
                  borderColor: category === "amor-proprio" ? "rgba(168, 85, 247, 0.25)" : "rgba(226, 168, 154, 0.25)",
                  boxShadow: category === "amor-proprio" 
                    ? "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1.5px 0 rgba(168, 85, 247, 0.2)" 
                    : "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1.5px 0 rgba(226, 168, 154, 0.2)"
                }}
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    Resultados da Busca ({motivosCategoria.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase())).length})
                  </h3>
                  <button onClick={() => setSearchQuery("")} className="text-xs text-rose-300 hover:underline font-semibold">Limpar</button>
                </div>
                
                <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2.5 pr-2">
                  {motivosCategoria
                    .map((m, idx) => ({ text: m, day: idx + 1 }))
                    .filter(item => item.text.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item) => (
                      <div 
                        key={item.day}
                        onClick={() => {
                          setDiaAtual(item.day);
                          setSearchQuery("");
                        }}
                        className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all flex items-start gap-4"
                      >
                        <span className="font-serif-elegant font-bold text-rose-gold-metallic text-base">#{item.day}</span>
                        <p className="text-xs font-light text-white/80 leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  {motivosCategoria.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                    <div className="text-center py-12 text-white/30 text-xs">Nenhum motivo encontrado para "{searchQuery}".</div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* High-End Frosted Glass Motive Card with Mobile Swipe Support */}
                <div 
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="glass-premium glass-premium-hover rounded-[32px] overflow-hidden flex flex-col justify-between min-h-[420px] xs:min-h-[460px] active:scale-[0.99] transition-all duration-500 cursor-grab border"
                style={{
                  borderColor: category === "amor-proprio" ? "rgba(168, 85, 247, 0.25)" : "rgba(226, 168, 154, 0.25)",
                  boxShadow: category === "amor-proprio" 
                    ? "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1.5px 0 rgba(168, 85, 247, 0.25)" 
                    : "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1.5px 0 rgba(226, 168, 154, 0.25)"
                }}
              >
                {/* Header detail */}
                <div className="px-6 sm:px-10 py-5 sm:py-6 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-bold tracking-[0.25em] text-white/45 uppercase">
                    {dataAtual}
                  </span>
                  
                  {/* Bookmark Button */}
                  <button 
                    onClick={toggleFavorite}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 hover:border-white/20 transition-all group"
                  >
                    <Heart 
                      className={cn(
                        "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                        isFavorited 
                          ? "fill-[#e2a89a] text-[#e2a89a]" 
                          : "text-white/50 hover:text-white"
                      )} 
                    />
                  </button>
                </div>

                {/* Day number & message block with slide/fade transitions */}
                <div 
                  className={cn(
                    "px-6 sm:px-10 py-8 sm:py-12 flex flex-col items-center flex-grow justify-center relative transition-all duration-300 transform",
                    isChanging
                      ? (slideDirection === "right" 
                          ? "-translate-x-8 opacity-0 scale-95" 
                          : "translate-x-8 opacity-0 scale-95")
                      : "translate-x-0 opacity-100 scale-100"
                  )}
                >
                  {/* Faint luxury vector watermark quotation marks */}
                  <div className="absolute top-4 left-6 text-[140px] text-white/5 font-serif select-none pointer-events-none">“</div>
                  <div className="absolute bottom-[-50px] right-6 text-[140px] text-white/5 font-serif select-none pointer-events-none">”</div>
                  
                  {/* Large Stylized Day Indicator */}
                  <div className="flex items-baseline gap-2.5 mb-6">
                    <span className="text-6xl xs:text-7xl sm:text-8xl font-serif-elegant font-bold text-white tracking-tighter leading-none drop-shadow-2xl">
                      {diaAtual}
                    </span>
                    <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">
                      / {motivosCategoria.length}
                    </span>
                  </div>

                  {/* Main Motive Quote text */}
                  <p className="text-base xs:text-lg sm:text-xl md:text-2xl italic font-serif-elegant font-light text-white/95 leading-relaxed max-w-lg text-center relative z-10 px-2 sm:px-4">
                    {motivo}
                  </p>
                </div>

                {/* Card navigation tools - thumb friendly spacing */}
                <div className="px-6 sm:px-10 py-5 sm:py-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between gap-4">
                  {/* Previous Button */}
                  <button
                    onClick={diaAnterior}
                    disabled={diaAtual === 1}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center transition-all border",
                      diaAtual === 1
                        ? "bg-white/5 border-transparent text-white/15 cursor-not-allowed"
                        : "bg-white/5 hover:bg-white/10 border-white/5 text-white active:scale-95 shadow-xl"
                    )}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Desktop navigation dots (hidden on mobile to save space) */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    {[...Array(Math.min(5, motivosCategoria.length))].map((_, i) => {
                      const isActive = i === Math.min(diaAtual - 1, 4);
                      return (
                        <div
                          key={i}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            isActive ? "w-6 bg-[#e2a89a]" : "w-1.5 bg-white/20"
                          )}
                        />
                      );
                    })}
                  </div>

                  <span className="text-[10px] tracking-wider text-white/40 uppercase font-semibold sm:hidden select-none">
                    Arraste para o lado
                  </span>

                  {/* Next Button */}
                  <button
                    onClick={proximoDia}
                    disabled={diaAtual === motivosCategoria.length}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center transition-all border",
                      diaAtual === motivosCategoria.length
                        ? "bg-white/5 border-transparent text-white/15 cursor-not-allowed"
                        : "bg-white/5 hover:bg-white/10 border-white/5 text-white active:scale-95 shadow-xl"
                    )}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

              </div>

              {/* Share block directly below the card */}
              <div className="glass-premium p-5 rounded-[24px] border border-white/5 w-full mt-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5 text-center sm:text-left">
                    <span className="text-[9px] tracking-[0.2em] text-rose-gold-metallic uppercase font-bold">
                      Compartilhar Motivo
                    </span>
                    <h3 className="text-white text-xs font-medium">
                      {category === "amor-proprio" ? "Inspire outros a se amarem" : "Envie este carinho especial"}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e2a89a] to-[#f43f5e] hover:brightness-105 active:scale-95 text-rose-950 text-xs font-bold tracking-wide transition-all shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-rose-950" />
                      Gerar Card
                    </button>
                    
                    <div className="h-6 w-px bg-white/10 hidden xs:block" />

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={shareToWhatsApp}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-400/20 text-white/70 hover:text-emerald-300 flex items-center justify-center transition-all"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={shareToFacebook}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-400/20 text-white/70 hover:text-blue-300 flex items-center justify-center transition-all"
                        title="Facebook"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={shareToTelegram}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-sky-500/10 border border-white/10 hover:border-sky-400/20 text-white/70 hover:text-sky-300 flex items-center justify-center transition-all"
                        title="Telegram"
                      >
                        <Send className="w-4 h-4" />
                      </button>

                      <button
                        onClick={copyToClipboard}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 text-white/70 hover:text-white flex items-center justify-center transition-all"
                        title="Copiar Texto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          </div>

          {/* Left panel: Info & Navigation Drawer - Displays below Card on Mobile */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full text-left order-2">
            
            {/* Search & Jump Tools Container */}
            <div className="glass-premium p-6 rounded-3xl border border-white/5">
              <h2 className="text-white font-serif-elegant text-base font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e2a89a]" />
                Navegação Rápida
              </h2>
              
              {/* Jump Form */}
              <form onSubmit={handleJumpToDay} className="flex flex-col gap-1.5 mb-5">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Pular para Dia</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max={motivosCategoria.length}
                    value={dayInput}
                    onChange={(e) => setDayInput(e.target.value)}
                    placeholder={`Ex: 1 a ${motivosCategoria.length}`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-gold transition-colors"
                  />
                  <button type="submit" className="absolute right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                    <ArrowRight className="w-3.5 h-3.5 text-white/80" />
                  </button>
                </div>
              </form>

              {/* Keyword Search Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Buscar Motivo</label>
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 w-3.5 h-3.5 text-white/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Digite palavras chave..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-gold transition-colors"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 p-1 rounded-full hover:bg-white/10 transition-colors">
                      <X className="w-3 h-3 text-white/60" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Special Settings Container (Anniversary Date, Push Notifications, App Lock) */}
            <div className="glass-premium p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
              <h2 className="text-white font-serif-elegant text-base font-semibold flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#e2a89a]" />
                Modo Especial & Lembretes
              </h2>

              {/* Anniversary Start Date Toggle */}
              <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[11px] text-white/80 font-medium">Data de Aniversário</label>
                    <span className="text-[9px] text-white/45">Calcular dia pelo seu namoro</span>
                  </div>
                  <button 
                    onClick={() => {
                      const newMode = !isSpecialDateMode;
                      setIsSpecialDateMode(newMode);
                      localStorage.setItem("motivos_special_mode", String(newMode));
                    }}
                    className={cn(
                      "w-10 h-6 rounded-full p-0.5 transition-colors duration-300",
                      isSpecialDateMode ? "bg-[#e2a89a]" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-rose-950 transition-transform duration-300",
                      isSpecialDateMode ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>
                
                {isSpecialDateMode && (
                  <input
                    type="date"
                    value={specialStartDate}
                    onChange={(e) => {
                      const dateVal = e.target.value;
                      setSpecialStartDate(dateVal);
                      localStorage.setItem("motivos_special_start_date", dateVal);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-gold transition-colors mt-1"
                  />
                )}
              </div>

              {/* Local Notification PWA Reminder */}
              <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[11px] text-white/80 font-medium">Lembretes Diários</label>
                    <span className="text-[9px] text-white/45">Receba alertas no seu celular</span>
                  </div>
                  <button 
                    onClick={toggleReminder}
                    className={cn(
                      "w-10 h-6 rounded-full p-0.5 transition-colors duration-300",
                      reminderEnabled ? "bg-[#e2a89a]" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-rose-950 transition-transform duration-300",
                      reminderEnabled ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>

              {/* Lock App / Reset Button */}
              <button
                onClick={() => {
                  localStorage.removeItem("motivos_unlocked");
                  setIsUnlocked(false);
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] uppercase tracking-wider text-rose-300/80 font-bold transition-all"
              >
                Bloquear Aplicativo (Senha)
              </button>
            </div>

            {/* Bookmarked Favorites Grid View */}
            <div className="glass-premium p-6 rounded-3xl border border-white/5 flex flex-col gap-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-[#e2a89a]" />
                  </div>
                  <div>
                    <h4 className="text-[9px] text-white/35 uppercase tracking-widest font-semibold">Salvos nesta Lista</h4>
                    <p className="text-xs font-bold text-white">{totalFavorites} favoritos</p>
                  </div>
                </div>
              </div>
              
              {/* Elegant scrollable Grid displaying favorited numbers */}
              {totalFavorites > 0 ? (
                <div className="border-t border-white/5 pt-3 mt-1">
                  <div className="grid grid-cols-6 xs:grid-cols-8 sm:grid-cols-6 gap-1.5 max-h-[115px] overflow-y-auto pr-1">
                    {favoritedList.map(favIdx => (
                      <button
                        key={favIdx}
                        onClick={() => setDiaAtual(favIdx + 1)}
                        className={cn(
                          "h-8 rounded-lg text-xs font-bold transition-all border border-white/5",
                          diaAtual === favIdx + 1
                            ? "bg-[#e2a89a] text-rose-950 shadow-md font-extrabold"
                            : "bg-white/5 hover:bg-white/10 text-white/75"
                        )}
                      >
                        {favIdx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-white/30 italic text-center py-2">Favorite motivos para vê-los aqui.</p>
              )}
            </div>
          </div>

        </main>

        {/* Footer legalities */}
        <footer className="w-full text-center text-white/20 text-[9px] tracking-widest uppercase mt-6 select-none">
          Feito com muito amor e carinho • 365 motivos ❤️
        </footer>

      </div>

      {/* Social Card sharing visual preview modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/85 backdrop-blur-md transition-all">
          <div className="glass-premium border border-white/10 rounded-[32px] max-w-md xs:max-w-xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
            
            {/* Modal Head */}
            <div className="p-5 xs:p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#e2a89a]" />
                <h3 className="text-white font-serif-elegant text-base font-semibold">Designer de Card</h3>
              </div>
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 xs:p-6 overflow-y-auto flex-1 flex flex-col items-center gap-5">
              
              {/* Aspect Ratio select pill toggler */}
              <div className="flex bg-black/45 p-1 rounded-xl border border-white/5 w-fit">
                <button
                  onClick={() => setShareFormat("post")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all",
                    shareFormat === "post"
                      ? "bg-white/10 text-[#e2a89a]"
                      : "text-white/40 hover:text-white/70"
                  )}
                >
                  Post (1:1 Quadrado)
                </button>
                <button
                  onClick={() => setShareFormat("story")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all",
                    shareFormat === "story"
                      ? "bg-white/10 text-[#e2a89a]"
                      : "text-white/40 hover:text-white/70"
                  )}
                >
                  Stories (9:16 Vertical)
                </button>
              </div>

              {/* Offscreen rendering Canvas target */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Rendered Preview output image wrapper */}
              <div className="relative border border-white/10 rounded-2xl overflow-hidden bg-black/35 max-w-[280px] xs:max-w-[320px] shadow-2xl flex items-center justify-center">
                {isGenerating ? (
                  <div className="w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] flex flex-col items-center justify-center gap-3 text-white/60 text-xs font-light">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#e2a89a]" />
                    Gerando card em HD...
                  </div>
                ) : previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Motive card render preview" 
                    className={cn(
                      "w-full h-auto max-h-[42vh] xs:max-h-[50vh] object-contain",
                      shareFormat === "story" ? "aspect-[9/16]" : "aspect-square"
                    )}
                  />
                ) : (
                  <div className="w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] flex items-center justify-center text-white/30 text-xs">
                    Visualização Indisponível
                  </div>
                )}
              </div>

              <p className="text-[10px] xs:text-[11px] font-light text-white/45 max-w-xs text-center leading-relaxed">
                Este card foi projetado para exibição perfeita em celulares no WhatsApp, Instagram e Facebook.
              </p>

              {/* Customization Options Panel */}
              <div className="w-full flex flex-col gap-3.5 border-t border-white/5 pt-4 text-left">
                <span className="text-[10px] tracking-wider text-[#e2a89a] uppercase font-bold">Personalizar Estilo</span>
                
                {/* 1. Card Theme Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Tema de Fundo</label>
                  <div className="grid grid-cols-3 gap-1 bg-black/45 p-1 rounded-xl border border-white/5">
                    {([
                      { id: "category", label: "Padrão" },
                      { id: "alternate", label: "Alternativo" },
                      { id: "minimal", label: "Veludo" }
                    ] as const).map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => setCardTheme(theme.id)}
                        className={cn(
                          "py-1.5 rounded-lg text-[10px] font-bold transition-all",
                          cardTheme === theme.id ? "bg-white/10 text-[#e2a89a]" : "text-white/40 hover:text-white/70"
                        )}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Text Color Mode Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Cor dos Textos</label>
                  <div className="grid grid-cols-3 gap-1 bg-black/45 p-1 rounded-xl border border-white/5">
                    {([
                      { id: "white", label: "Branco" },
                      { id: "gold", label: "Dourado" },
                      { id: "rose", label: "Rose Gold" }
                    ] as const).map(color => (
                      <button
                        key={color.id}
                        onClick={() => setTextColorMode(color.id)}
                        className={cn(
                          "py-1.5 rounded-lg text-[10px] font-bold transition-all",
                          textColorMode === color.id ? "bg-white/10 text-[#e2a89a]" : "text-white/40 hover:text-white/70"
                        )}
                      >
                        {color.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Watermark Toggle */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                  <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Marca d'água</span>
                  <button
                    onClick={() => setShowWatermark(!showWatermark)}
                    className={cn(
                      "w-9 h-5 rounded-full p-0.5 transition-colors duration-300",
                      showWatermark ? "bg-[#e2a89a]" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-rose-950 transition-transform duration-300",
                      showWatermark ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 xs:p-6 bg-white/[0.02] border-t border-white/5 flex gap-2">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs tracking-wide transition-all border border-white/5"
              >
                Voltar
              </button>
              
              {/* Native Mobile Share Button */}
              {isWebShareSupported && (
                <button
                  onClick={shareNativeImage}
                  disabled={isGenerating || !previewImage}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:pointer-events-none text-[#e2a89a] font-bold text-xs tracking-wide transition-all border border-white/10 flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 text-[#e2a89a]" />
                  Compartilhar
                </button>
              )}
              
              <button
                onClick={downloadCard}
                disabled={isGenerating || !previewImage}
                className={cn(
                  "py-3 rounded-xl bg-[#e2a89a] hover:bg-[#e2a89a]/95 disabled:opacity-50 disabled:pointer-events-none text-rose-950 font-bold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-1.5 active:scale-95",
                  isWebShareSupported ? "px-4" : "flex-1"
                )}
              >
                <Download className="w-4 h-4 text-rose-950" />
                Baixar (PNG)
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
