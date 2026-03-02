using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Entities;
using Domain.Enums;
using FluentAssertions;
using Infrastructure.Authentication;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace InfrastructureTests.Authentication;

public class JwtTokenGeneratorTests
{
    private readonly JwtTokenGenerator _sut;
    private readonly IConfiguration _config;
    private const string SecretKey = "super_secret_key_for_testing_purposes_only_32_chars";

    public JwtTokenGeneratorTests()
    {
        var inMemorySettings = new Dictionary<string, string> {
            {"Jwt:Key", SecretKey},
            {"Jwt:Issuer", "TestIssuer"},
            {"Jwt:Audience", "TestAudience"},
        };

        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings!)
            .Build();

        _sut = new JwtTokenGenerator(_config);
    }

    [Fact]
    public void GenerateToken_Should_CreateTokenWithCorrectClaims()
    {
        // Arrange
        var user = new User("John", "Doe", "john@test.com", "hash", "+380000000");

        // Act
        var token = _sut.GenerateToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();

        var handler = new JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        jwtToken.Issuer.Should().Be("TestIssuer");
        jwtToken.Claims.First(c => c.Type == ClaimTypes.NameIdentifier).Value.Should().Be(user.Id.ToString());
        jwtToken.Claims.First(c => c.Type == JwtRegisteredClaimNames.Email).Value.Should().Be(user.Email);
    }

    [Fact]
    public void GenerateRefreshToken_Should_ReturnUniqueSecureString()
    {
        // Act
        var (token1, _) = _sut.GenerateRefreshToken();
        var (token2, _) = _sut.GenerateRefreshToken();

        // Assert
        token1.Should().NotBeNullOrEmpty();
        token1.Should().NotBe(token2);
    }

    [Fact]
    public void GetUserIdFromExpiredToken_Should_ReturnUserId_EvenIfTokenIsExpired()
    {
        // Arrange
        var user = new User("John", "Doe", "john@test.com", "hash", "+380000000");
        var token = _sut.GenerateToken(user);

        // Act
        var resultId = _sut.GetUserIdFromExpiredToken(token);

        // Assert
        resultId.Should().Be(user.Id);
    }

    [Fact]
    public void GetUserIdFromExpiredToken_Should_ReturnNull_WhenTokenIsInvalid()
    {
        // Arrange
        var invalidToken = "not.a.valid.token";

        // Act
        var resultId = _sut.GetUserIdFromExpiredToken(invalidToken);

        // Assert
        resultId.Should().BeNull();
    }
}
