module SBA301_Hibernate_project { // Khớp với artifactId trong pom
    requires javafx.controls;
    requires javafx.fxml;
    requires javafx.base;
    requires jakarta.persistence;
    requires org.hibernate.orm.core;
    requires java.sql;
    requires java.naming;

    opens org.example.controller to javafx.fxml;
    opens org.example.pojos to org.hibernate.orm.core, javafx.base;

    exports org.example;
    exports org.example.controller;
    exports org.example.pojos;
}