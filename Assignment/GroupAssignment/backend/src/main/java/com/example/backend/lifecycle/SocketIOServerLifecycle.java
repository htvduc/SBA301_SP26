package com.example.backend.lifecycle;

import com.corundumstudio.socketio.SocketIOServer;
import com.example.backend.handler.SocketIOEventHandler;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SocketIOServerLifecycle implements ApplicationListener<ContextRefreshedEvent> {

    private final SocketIOServer socketIOServer;
    private final SocketIOEventHandler eventHandler;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        socketIOServer.addConnectListener(eventHandler::onConnect);
        socketIOServer.addEventListener("authenticate", String.class, (client, token, ackRequest) -> 
            eventHandler.onAuthenticate(client, token));
        socketIOServer.addDisconnectListener(eventHandler::onDisconnect);
        socketIOServer.addEventListener("ping", Void.class, (client, data, ackRequest) -> 
            eventHandler.onPing(client));
        
        socketIOServer.start();
        log.info("SocketIO server started successfully on port {}", socketIOServer.getConfiguration().getPort());
    }

    @PreDestroy
    public void onShutdown() {
        log.info("Stopping SocketIO server...");
        socketIOServer.stop();
        log.info("SocketIO server stopped successfully");
    }
}
