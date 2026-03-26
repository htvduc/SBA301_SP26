package com.example.backend.dto.request;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionReminderMailRequest {
    private String mail;       
    private String name;        
    private String packageName; 
    private String endDate;      
    private String renewLink;
}
