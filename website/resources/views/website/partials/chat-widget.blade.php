<div class="chat-widget" id="chatWidget">
    <div class="chat-popup" id="chatPopup">
        <div class="chat-popup__header" id="chatHeader">
            <div class="chat-popup__title">
                <div class="chat-popup__avatar" id="chatAvatar">
                    <img src="{{ asset('website/images/favicon.png') }}" alt="Support">
                </div>
                <div>
                    <strong id="chatHeaderName">SHAREIDE Support</strong>
                    <span class="online-status" id="chatHeaderStatus"><span class="online-dot"></span> Online</span>
                </div>
            </div>
            <button class="chat-popup__close" id="chatClose">
                <i class="fas fa-times"></i>
            </button>
        </div>

        {{-- Agent profile bar: shown when live agent connects --}}
        <div class="chat-agent-bar" id="agentBar" style="display:none;">
            <div class="chat-agent-bar__avatar" id="agentAvatar"></div>
            <div class="chat-agent-bar__info">
                <span class="chat-agent-bar__name" id="agentName"></span>
                <span class="chat-agent-bar__role">Support Agent</span>
            </div>
            <span class="chat-agent-bar__live"><span class="pulse-dot"></span> Live</span>
        </div>

        {{-- Contact form: hidden by default, only shown if JS falls back --}}
        <div class="chat-popup__contact" id="contactInfoForm" style="display:none;">
            <h4>Start a conversation</h4>
            <input type="text" id="contactName" placeholder="Your name *">
            <input type="email" id="contactEmail" placeholder="Your email *">
            <input type="tel" id="contactPhone" placeholder="Phone (optional)">
            <button class="btn btn--primary btn--sm" id="startChatBtn" style="width:100%;justify-content:center;margin-top:5px;">
                <i class="fas fa-paper-plane"></i> Start Chat
            </button>
        </div>

        <div class="chat-popup__messages" id="chatMessages" style="display:none;"></div>

        <div class="chat-popup__quick" id="quickButtons" style="display:none;"></div>

        <div class="chat-popup__file-preview" id="chatFilePreview" style="display:none;">
            <div class="chat-file-preview">
                <div class="chat-file-preview__thumb" id="chatFileThumb"><i class="fas fa-file"></i></div>
                <div class="chat-file-preview__info">
                    <span class="chat-file-preview__name" id="chatFileName"></span>
                    <span class="chat-file-preview__size" id="chatFileSize"></span>
                </div>
                <button class="chat-file-preview__remove" id="chatFileRemove"><i class="fas fa-times"></i></button>
            </div>
        </div>
        <form class="chat-popup__form" id="chatForm" style="display:none;">
            <input type="file" id="chatFileInput" style="display:none;" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip">
            <button type="button" class="chat-attach-btn" id="chatAttachBtn" title="Attach file"><i class="fas fa-paperclip"></i></button>
            <input type="text" placeholder="Type your question..." id="chatInput">
            <button type="submit"><i class="fas fa-paper-plane"></i></button>
        </form>

        <button class="chat-popup__new-ticket" id="newTicketBtn" style="display:none;">
            <i class="fas fa-plus"></i> New Conversation
        </button>
    </div>

    <button class="chat-toggle" id="chatToggle">
        <i class="fas fa-comments"></i>
        <span class="chat-badge">1</span>
    </button>
</div>
