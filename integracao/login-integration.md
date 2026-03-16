# ![Login](https://i.ibb.co/KhPMP0Y/icon.png)

# PI Login - Integração

## 🚀 Começando

Passos para integração com o **SSO PI Login** (Keycloak) para projetos frontend e backend

### 📋 Pré-requisitos

Para a integração e uso externo do PI Login você deverá solicitar a algum dos devs da ETIPI a criação de 'client' para a sua determinada secretaria, empresa ou projeto (ex: detran, cendfol) dentro do REALM que deseja integrar. Caso deseja fornecer seu login para os usuários já cadastrados no aplicativo **GovPI Cidadão** o REALM deverá ser 'PI'.

### 🔧 Instalação

#### REACT + KEYCLOAKJS

Para realizar o uso do login em testes utilize a plataforma de [Login em Desenvolvimento](https://dev.login.pi.gov.br/auth) e as demais variáveis de ambiente fornecidas pelo desenvolvedor responsável na ETIPI

```m
AUTH_LOGIN_REALM="pi"
AUTH_LOGIN_CLIENT_ID="<client-id>"
AUTH_LOGIN_URL="https://dev.login.pi.gov.br/auth"
```

Instale em seu projeto frontend a biblioteca [KeycloakJS](https://www.npmjs.com/package/keycloak-js)

Com npm:

```shell
 npm i keycloak-js
```

Com yarn:

```shell
 yarn add keycloak-js
```

Crie um inicializador das configurações do Keycloak

```Javascript
get-keycloak-instance.ts

import { ConfigKey, getConfig } from "../../config/app.config";

interface KeycloakConfig {
  realm: string;
  url: string;
  clientId: string;
}

function getKeycloakConfig(): KeycloakConfig {
  return {
    url: getConfig(ConfigKey.AUTH_LOGIN_URL),
    realm: getConfig(ConfigKey.AUTH_LOGIN_REALM),
    clientId: getConfig(ConfigKey.AUTH_LOGIN_CLIENT_ID),
  };
}

export function keycloak(): Keycloak.KeycloakInstance {
  const keycloakConfig = getKeycloakConfig();
  return Keycloak(keycloakConfig);
}
```

Na tela que houver o botão de 'login' ou 'entrar' acione o seguinte método

```Typescript
import { keycloak } from "get-keycloak-instance.ts"

const onLogin = useCallback(() => {
    keycloak?.login();
}, [keycloak]);

const onLogin = useCallback(() => {
    keycloak?.logout();
}, [keycloak]);

return (
   <Menu
      id="user-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "basic-button",
      }}
    >
      <MenuItem key="login" onClick={onLogin}>
        Entrar
      </MenuItem>
      <MenuItem key="logout" onClick={onLogout}>
        Sair
      </MenuItem>
  </Menu>
)}
```

Uma vez logado você deverá possuir em mãos uma const 'keycloak' dotada de diversos métodos úteis como:

`keycloak.token` : Bearer Token enviado nos headers de requisições para validação no backend; <br>
`keycloak.loadUserProfile()`: Retorna os dados do perfil do usuário como username(cpf), id, data de criação.

Com o token também é possível extrair diversas informções úteis pois o mesmo em seu payload carrega vários dados do perfil do usuário

#### SPRINGBOOT + OAUTH2

Para uma segunda validação o backend também deverá se comunicar com o keycloak, afim de impedir chamadas não autorizados nos endpoints. Para tal segue o exemplo da integração com Java + Spring Boot

#### Adicione ao pom.xml da sua API as seguintes dependências

```XML
<dependency>
  <groupId>org.springframework.security</groupId>
  <artifactId>spring-security-core</artifactId>
  <version>6.1.2</version>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
  <version>3.1.2</version>
</dependency>
```

<br>
<br>

Variáveis de ambiente

```
SSO_SERVER_URL="https://dev.login.pi.gov.br/auth"
SSO_REALM="pi"
ENV="dev"
```

Propriedades da aplicação (src>main>resources>application.yaml)

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${SSO_SERVER_URL}/realms/${SSO_REALM}
          jwk-set-uri: ${SSO_SERVER_URL}/realms/${SSO_REALM}/protocol/openid-connect/certs
enviroment: ${ENV}
```

<br>
<br>

Em um diretório config>security crie as seguintes classes JwtAuthConverter, JwtAuthConverterProperties e WebSecurity.java.

```java
package br.gov.pi.etipi.apiautista.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@Configuration
@ConfigurationProperties(prefix = "jwt.auth.converter")
public class JwtAuthConverterProperties {

  private String resourceId;
  private String principalAttribute;
}
```

```java
package br.gov.pi.etipi.apiautista.config;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JwtAuthConverter
  implements Converter<Jwt, AbstractAuthenticationToken> {

  @Value("${environment}")
  private String environment;

  @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
  private String issuerUri;

  private final JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();

  private final JwtAuthConverterProperties properties;

  public JwtAuthConverter(JwtAuthConverterProperties properties) {
    this.properties = properties;
  }

  @Override
  public AbstractAuthenticationToken convert(Jwt jwt) {
    Collection<GrantedAuthority> authorities = Stream
      .concat(
        jwtGrantedAuthoritiesConverter.convert(jwt).stream(),
        extractResourceRoles(jwt).stream()
      )
      .collect(Collectors.toSet());
    return new JwtAuthenticationToken(
      jwt,
      authorities,
      getPrincipalClaimName(jwt)
    );
  }

  private String getPrincipalClaimName(Jwt jwt) {
    String claimName = JwtClaimNames.SUB;
    if (properties.getPrincipalAttribute() != null) {
      claimName = properties.getPrincipalAttribute();
    }
    return jwt.getClaim(claimName);
  }

  private Collection<? extends GrantedAuthority> extractResourceRoles(Jwt jwt) {
    Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
    Map<String, Object> resource;
    Collection<String> resourceRoles;
    if (
      resourceAccess == null ||
      (
        resource =
          (Map<String, Object>) resourceAccess.get(properties.getResourceId())
      ) ==
      null ||
      (resourceRoles = (Collection<String>) resource.get("roles")) == null
    ) {
      return Set.of();
    }
    return resourceRoles
      .stream()
      .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
      .collect(Collectors.toSet());
  }

  @Bean
  JwtDecoder jwtDecoder() {
    NimbusJwtDecoder jwtDecoder = (NimbusJwtDecoder) JwtDecoders.fromIssuerLocation(
      issuerUri
    );
    jwtDecoder.setJwtValidator(jwtTokenValidator());
    return jwtDecoder;
  }

  //OPCIONAL
  private OAuth2TokenValidator<Jwt> jwtTokenValidator() {
    if (
      "local".equalsIgnoreCase(environment) ||
      "dev".equalsIgnoreCase(environment)
    ) {
      log.info("Environment: {}", environment);
      log.info("Validating JWT without expiration date");
    }

    return new OAuth2TokenValidator<Jwt>() {
      private final JwtTimestampValidator defaultTimestampValidator = new JwtTimestampValidator();

    //Não faz validação se o token está expirado quando local ou dev, apenas se é um token aceitável para a aplicação.
      @Override
      public OAuth2TokenValidatorResult validate(Jwt jwt) {
        if (
          "local".equalsIgnoreCase(environment) ||
          "dev".equalsIgnoreCase(environment)
        ) {
          return OAuth2TokenValidatorResult.success();
        }
        return defaultTimestampValidator.validate(jwt);
      }
    };
  }
}

```

```java
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

  private final JwtAuthConverter jwtAuthConverter;

  public WebSecurityConfig(JwtAuthConverter jwtAuthConverter) {
    this.jwtAuthConverter = jwtAuthConverter;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http)
    throws Exception {
    http.authorizeHttpRequests(authorize ->
      authorize
        .requestMatchers(HttpMethod.OPTIONS, "/**")
        .permitAll()
        .requestMatchers("/swagger-ui/**")
        .permitAll()
        .requestMatchers("/webjars/**")
        .permitAll()
        .requestMatchers("/swagger-resources/**")
        .permitAll()
        .requestMatchers("/v3/api-docs/**")
        .permitAll()
        .anyRequest()
        .authenticated()
    );
    http.csrf(csrf -> csrf.disable());
    http.oauth2ResourceServer(oauth2 ->
      oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter))
    );
    return http.build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("*"));
    configuration.setAllowedMethods(
      Arrays.asList("GET", "PATCH", "POST", "PUT", "DELETE", "OPTIONS")
    );
    configuration.setAllowedHeaders(
      Arrays.asList("Authorization", "Custom-Header", "Content-Type")
    );
    configuration.setExposedHeaders(
      Arrays.asList("Authorization", "Custom-Header")
    );
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}

```

## 📦 Exemplo de endpoint com validação

```Java
@RestController
@RequestMapping("/teste")
public class AtualizacaoController {
  @GetMapping
  public String obterAtualizacao(Principal principal) {
    JwtAuthenticationToken token = (JwtAuthenticationToken) principal;
    if (!token.isAuthenticated()) {
      throw new UnauthorizedError("Usuário não autenticado");
    }

    JwtAuthenticationToken token = (JwtAuthenticationToken) principal;
    String cpf = (String) token.getTokenAttributes().get("preferred_username");

    return `Olá usuário ${cpf}`;
  }
```

## ✒️ Autores

- _Backend_ - [Fernandoblima1](https://github.com/fernandoblima1)

---
