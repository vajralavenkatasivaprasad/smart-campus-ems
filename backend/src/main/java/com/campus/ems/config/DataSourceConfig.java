package com.campus.ems.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Bean
    public DataSource dataSource() {
        String host     = System.getenv("MYSQLHOST");
        String port     = System.getenv("MYSQLPORT");
        String database = System.getenv("MYSQLDATABASE");
        String user     = System.getenv("MYSQLUSER");
        String password = System.getenv("MYSQLPASSWORD");

        if (host == null || host.isBlank()) {
            throw new IllegalStateException("Required environment variable MYSQLHOST is not set");
        }
        if (port == null || port.isBlank()) {
            throw new IllegalStateException("Required environment variable MYSQLPORT is not set");
        }
        if (database == null || database.isBlank()) {
            throw new IllegalStateException("Required environment variable MYSQLDATABASE is not set");
        }
        if (user == null || user.isBlank()) {
            throw new IllegalStateException("Required environment variable MYSQLUSER is not set");
        }
        if (password == null) {
            log.warn("Environment variable MYSQLPASSWORD is not set — connecting without a password");
            password = "";
        }

        String jdbcUrl = String.format(
                "jdbc:mysql://%s:%s/%s?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true",
                host, port, database);

        log.info("Configuring DataSource: jdbc:mysql://{}:{}/{}", host, port, database);

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setUsername(user);
        config.setPassword(password);
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30_000);
        config.setIdleTimeout(600_000);
        config.setMaxLifetime(1_800_000);

        return new HikariDataSource(config);
    }
}
