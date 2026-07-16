'use client'

interface ConversationListProps {
  open: boolean
  onClose: () => void
  conversations: any[]
  currentId: string
  onSelect: (id: string) => void
  onNew: () => void
}

export default function ConversationList({
  open,
  onClose,
  conversations,
  currentId,
  onSelect,
  onNew,
}: ConversationListProps) {
  return (
    <>
      {/* 遮罩 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-72 bg-white z-50 shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-neutral-100">
          <button
            onClick={onNew}
            className="w-full py-2.5 rounded-xl bg-primary-300 text-white text-sm font-medium hover:bg-primary-400 transition"
          >
            + 新对话
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-65px)]">
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-400">
              还没有对话记录
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-neutral-50 transition hover:bg-neutral-50 ${
                  currentId === conv.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 truncate">
                    {conv.title}
                  </span>
                  <span className="text-xs text-neutral-400 flex-shrink-0 ml-2">
                    {conv.messageCount || 0}条
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {new Date(conv.lastMsgAt).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  )
}
