export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    AUDIO = "AUDIO",
    DOCUMENT = "DOCUMENT",
    TEMPLATE = "TEMPLATE"
}
export declare class SendMessageDto {
    conversation_id: string;
    content: string;
    type?: MessageType;
    media_url?: string;
}
export declare class CreateConversationDto {
    customer_id: string;
}
