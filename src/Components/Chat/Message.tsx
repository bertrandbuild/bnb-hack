"use client";

import { HiUser } from "react-icons/hi";
import { ChatMessage } from "./interface";
import Markdown from "react-markdown";
import styles from "./Message.module.css"

export interface MessageProps {
  message: ChatMessage;
}

const MessageUser = (props: ChatMessage) => {
  const { transactionHash, content } = props;
  return (
    <>
      <div className="avatar">
        <div className={`size-8 flex align-center justify-center bg-slate-500 p-[4px] rounded-full`}>
          <HiUser className="text-2xl" />
        </div>
      </div>
      <div
        className="userMessage"
        dangerouslySetInnerHTML={{
          __html: content.replace(
            /<(?!\/?br\/?.+?>|\/?img|\/?table|\/?thead|\/?tbody|\/?tr|\/?td|\/?th.+?>)[^<>]*>/gi,
            ""
          ),
        }}
      ></div>
      {transactionHash && (
        <div className="flex gap-4 items-center pt-2 pb-8 text-sm">
          <div>
            Transaction hash:
            <a
              className="underline pl-2"
              href={`https://explorer.galadriel.com/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transactionHash}
            </a>
          </div>
        </div>
      )}
    </>
  );
};

const ManagerMessage = (props: ChatMessage) => {
  const { content } = props;
  return (
    <>
      <div className="avatar">
        <div className={`size-8 bg-green-500 rounded-full mt-4`}>
          <img alt="avatar manager" src={'https://picsum.photos/200/300'} />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Markdown>{content}</Markdown>
      </div>
    </>
  );
};

const Message = (props: MessageProps) => {
  const { role } = props.message;
  const isUser = role === "user";

  return (
    <div className="message w-full">
      <div className={`text-secondary ${styles['markdown-container']}`}>
        {isUser ? (
          <MessageUser {...props.message} />
        ) : (
          <ManagerMessage {...props.message} />
        )}
      </div>
    </div>
  );
};

export default Message;
