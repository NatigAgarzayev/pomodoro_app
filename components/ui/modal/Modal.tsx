import React, { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <Pressable
            className="fixed inset-0 z-50 h-full flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onPress={onClose}
            role="dialog"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Fallback for opacity
        >
            <Pressable
                className="bg-white rounded-lg shadow-lg p-6 relative min-w-[300px] max-w-lg"
                onPress={e => e.stopPropagation()}
            >
                <Pressable
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onPress={onClose}
                    aria-label="Close modal"
                >
                    <Text>
                        &times;

                    </Text>
                </Pressable>
                {children}
            </Pressable>
        </Pressable>
    );
};

export default Modal