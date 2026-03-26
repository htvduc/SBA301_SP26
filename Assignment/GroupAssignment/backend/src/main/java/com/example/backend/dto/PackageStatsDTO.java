package com.example.backend.dto;

import java.math.BigDecimal;

public class PackageStatsDTO {
    private String packageName;
    private Long newSubscriptions;
    private Long renewals;
    private Long upgrades;
    private Long totalSubscriptions;
    private BigDecimal totalRevenue;
    private String period;

    public PackageStatsDTO() {}

    public PackageStatsDTO(String packageName, Long newSubscriptions, Long renewals, Long upgrades, BigDecimal totalRevenue, String period) {
        this.packageName = packageName;
        this.newSubscriptions = newSubscriptions;
        this.renewals = renewals;
        this.upgrades = upgrades;
        this.totalSubscriptions = newSubscriptions + renewals + upgrades;
        this.totalRevenue = totalRevenue;
        this.period = period;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public Long getNewSubscriptions() {
        return newSubscriptions;
    }

    public void setNewSubscriptions(Long newSubscriptions) {
        this.newSubscriptions = newSubscriptions;
    }

    public Long getRenewals() {
        return renewals;
    }

    public void setRenewals(Long renewals) {
        this.renewals = renewals;
    }

    public Long getUpgrades() {
        return upgrades;
    }

    public void setUpgrades(Long upgrades) {
        this.upgrades = upgrades;
    }

    public Long getTotalSubscriptions() {
        return totalSubscriptions;
    }

    public void setTotalSubscriptions(Long totalSubscriptions) {
        this.totalSubscriptions = totalSubscriptions;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }
}