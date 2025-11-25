const sendGamificationPoint =
  (producer) =>
  (karma_lookup_code = "ACCOUNT_REFERAL", employee_id = 5) => {
    const message = {
      karma_lookup_code,
      employee_id,
    };
    return producer.sendMessage(
      "add-karma:gamification",
      JSON.stringify(message)
    );
  };

module.exports = sendGamificationPoint;
