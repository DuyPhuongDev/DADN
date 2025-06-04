package hcmut.dadn.be.util;

import hcmut.dadn.be.exception.InvalidParamException;
import hcmut.dadn.be.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenUtil {
    @Value("${jwt.access.expiration}")
    private int accessExpiration; // 15 minutes in milliseconds
    
    @Value("${jwt.refresh.expiration}")
    private int refreshExpiration; // 7 days in milliseconds
    
    @Value("${jwt.secretKey}")
    private String secretKey;
    
    public Map<String, String> generateTokenPair(User user) throws InvalidParamException {
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", generateAccessToken(user));
        tokens.put("refreshToken", generateRefreshToken(user));
        return tokens;
    }
    
    public String generateAccessToken(User user) throws InvalidParamException {
        return generateToken(user, accessExpiration, false);
    }
    
    public String generateRefreshToken(User user) throws InvalidParamException {
        return generateToken(user, refreshExpiration, true);
    }
    
    private String generateToken(User user, int expiration, boolean isRefreshToken) throws InvalidParamException {
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", user.getUsername());
        claims.put("userId", user.getId());
        if (isRefreshToken) {
            claims.put("isRefreshToken", true);
        }
        try {
            String token = Jwts.builder()
                    .claims(claims)
                    .subject(user.getUsername())
                    .expiration(new Date(System.currentTimeMillis() + expiration))
                    .signWith(getSigningKey())
                    .compact();
            return token;
        } catch (Exception e) {
            throw new InvalidParamException("Cannot create jwt token, error: " + e.getMessage());
        }
    }
    
    private SecretKey getSigningKey(){
        byte[] bytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(bytes);
    }
    
    private Claims extractAllClaims(String token) throws IllegalArgumentException{
        try{
            return Jwts.parser()
                    .verifyWith(getSigningKey()) //verify signature
                    .build()
                    .parseSignedClaims(token) //parse token to extract claims
                    .getPayload();
        }catch (Exception e){
            throw new IllegalArgumentException("Cannot extract all claims, error: "+e.getMessage());
        }
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimResolver){
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }
    
    private Boolean isTokenExpired(String token){
        Date expiredDate = extractClaim(token, Claims::getExpiration);
        return expiredDate.before(new Date());
    }
    
    public String extractUsername(String token){
        return extractClaim(token, Claims::getSubject);
    }
    
    public boolean isRefreshToken(String token) {
        try {
            Boolean isRefresh = extractClaim(token, claims -> claims.get("isRefreshToken", Boolean.class));
            return isRefresh != null && isRefresh;
        } catch (Exception e) {
            return false;
        }
    }
    
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }
    
    public Boolean validateToken(String token, UserDetails user){
        final String username = extractUsername(token);
        return (username.equals(user.getUsername()) && !isTokenExpired(token));
    }
}
