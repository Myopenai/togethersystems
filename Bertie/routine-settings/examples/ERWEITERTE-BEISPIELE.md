# ERWEITERTE BEISPIELE
## Praktische Journey-Beispiele & Use Cases

**Version:** 1.0.0  
**Erstellt:** 2025-01-27  
**Zweck:** Konkrete, produktionsreife Journey-Beispiele

---

## 1. E-COMMERCE: ABANDONED CART RECOVERY

### 1.1 Use Case
Warenkorb wurde verlassen → automatische Recovery-Kampagne mit abgestuften Rabatten

### 1.2 Journey-Definition (DSL)

```
DEFINE JOURNEY abandoned_cart_recovery
  TRIGGER ON event "cart_abandoned"
  REENTRY_POLICY: skip
  
  NODE send_first_reminder (send_message)
    CHANNEL: email_channel
    TEMPLATE: cart_reminder_1
    NEXT: wait_2h

  NODE wait_2h (wait)
    TYPE: duration
    DURATION: 2 HOURS
    NEXT: check_cart_status

  NODE check_cart_status (condition)
    IF EXISTS event WHERE
         event.type = "purchase"
         AND event.properties.cart_id = journey.state.cart_id:
      NEXT: exit_completed
    ELSE:
      NEXT: wait_24h

  NODE wait_24h (wait)
    TYPE: duration
    DURATION: 24 HOURS
    NEXT: check_cart_status_2

  NODE check_cart_status_2 (condition)
    IF EXISTS event WHERE
         event.type = "purchase"
         AND event.properties.cart_id = journey.state.cart_id:
      NEXT: exit_completed
    ELSE:
      NEXT: send_second_reminder

  NODE send_second_reminder (send_message)
    CHANNEL: email_channel
    TEMPLATE: cart_reminder_2_with_10_discount
    NEXT: update_discount_tag

  NODE update_discount_tag (update_contact)
    ADD tags = "cart_abandoned_10_off"
    NEXT: wait_48h

  NODE wait_48h (wait)
    TYPE: duration
    DURATION: 48 HOURS
    NEXT: check_cart_status_3

  NODE check_cart_status_3 (condition)
    IF EXISTS event WHERE
         event.type = "purchase"
         AND event.properties.cart_id = journey.state.cart_id:
      NEXT: exit_completed
    ELSE:
      NEXT: send_final_reminder

  NODE send_final_reminder (send_message)
    CHANNEL: email_channel
    TEMPLATE: cart_reminder_3_with_15_discount
    NEXT: update_discount_tag_final

  NODE update_discount_tag_final (update_contact)
    REMOVE tags = "cart_abandoned_10_off"
    ADD tags = "cart_abandoned_15_off"
    NEXT: wait_7d

  NODE wait_7d (wait)
    TYPE: duration
    DURATION: 7 DAYS
    NEXT: check_final_purchase

  NODE check_final_purchase (condition)
    IF EXISTS event WHERE
         event.type = "purchase":
      NEXT: exit_completed
    ELSE:
      NEXT: exit_abandoned

  NODE exit_completed (exit)
    REASON: "Cart recovered - purchase completed"
    NEXT: update_recovered_tag

  NODE update_recovered_tag (update_contact)
    ADD tags = "cart_recovered"
    REMOVE tags = "cart_abandoned_10_off"
    REMOVE tags = "cart_abandoned_15_off"
    NEXT: exit_end

  NODE exit_abandoned (exit)
    REASON: "Cart abandoned - final timeout"
    NEXT: exit_end

  NODE exit_end (exit)
    REASON: "Journey completed"
END
```

### 1.3 Templates

**cart_reminder_1:**
```
Subject: Du hast Artikel in deinem Warenkorb! 🛒

Hallo {{contact.attributes.first_name}},

Du hast Artikel in deinem Warenkorb, die noch auf dich warten!

Warenkorb-Wert: {{journey.state.cart_total | currency: EUR}}
Artikel-Anzahl: {{journey.state.cart_items_count}}

Zum Warenkorb: {{journey.state.cart_url}}

Viele Grüße,
{{workspace.name}}
```

**cart_reminder_2_with_10_discount:**
```
Subject: 10% Rabatt auf deinen Warenkorb! 🎁

Hallo {{contact.attributes.first_name}},

Wir haben gemerkt, dass du noch Artikel in deinem Warenkorb hast.
Als kleines Dankeschön: **10% Rabatt** auf deine Bestellung!

Rabattcode: CART10
Gültig bis: {{now() + 48h | format: DD.MM.YYYY HH:mm}}

Warenkorb-Wert: {{journey.state.cart_total | currency: EUR}}
Mit Rabatt: {{journey.state.cart_total * 0.9 | currency: EUR}}

Zum Warenkorb: {{journey.state.cart_url}}

Viele Grüße,
{{workspace.name}}
```

**cart_reminder_3_with_15_discount:**
```
Subject: Letzte Chance: 15% Rabatt! ⏰

Hallo {{contact.attributes.first_name}},

Das ist deine letzte Chance! **15% Rabatt** auf deinen Warenkorb!

Rabattcode: CART15
Gültig bis: {{now() + 7d | format: DD.MM.YYYY HH:mm}}

Warenkorb-Wert: {{journey.state.cart_total | currency: EUR}}
Mit Rabatt: {{journey.state.cart_total * 0.85 | currency: EUR}}

Zum Warenkorb: {{journey.state.cart_url}}

Viele Grüße,
{{workspace.name}}
```

### 1.4 Formale Logik

```
Journey abandoned_cart_recovery:

Trigger:
  trigger_condition(e, c) :=
    event_type(e) = "cart_abandoned"
    ∧ e.contact_id = c.id

State-Initialisierung:
  ji.state_data["cart_id"] = e.event_properties["cart_id"]
  ji.state_data["cart_total"] = e.event_properties["cart_total"]
  ji.state_data["cart_items_count"] = e.event_properties["items_count"]
  ji.state_data["cart_url"] = e.event_properties["cart_url"]

Bedingungen:

check_cart_status:
  condition :=
    ∃ e ∈ events_of_contact(c):
      event_type(e) = "purchase"
      ∧ event_properties(e)["cart_id"] = ji.state_data["cart_id"]

check_cart_status_2, check_cart_status_3 analog
```

---

## 2. SAAS: TRIAL-TO-PAID CONVERSION

### 2.1 Use Case
Trial-User durch Onboarding führen und zur Conversion bewegen

### 2.2 Journey-Definition (DSL)

```
DEFINE JOURNEY trial_to_paid_conversion
  TRIGGER ON event "trial_started"
  REENTRY_POLICY: skip
  
  NODE send_welcome (send_message)
    CHANNEL: email_channel
    TEMPLATE: trial_welcome
    NEXT: update_trial_start_date

  NODE update_trial_start_date (update_contact)
    SET attributes.trial_start_date = journey.state.entry_time
    ADD tags = "trial_user"
    NEXT: wait_1d

  NODE wait_1d (wait)
    TYPE: duration
    DURATION: 1 DAY
    NEXT: check_activation

  NODE check_activation (condition)
    IF EXISTS event WHERE
         event.type IN ("feature_used", "login", "data_imported")
         AND event.time >= journey.state.entry_time:
      NEXT: send_feature_guide
    ELSE:
      NEXT: send_activation_reminder

  NODE send_activation_reminder (send_message)
    CHANNEL: email_channel
    TEMPLATE: trial_activation_reminder
    NEXT: wait_2d

  NODE send_feature_guide (send_message)
    CHANNEL: email_channel
    TEMPLATE: trial_feature_guide
    NEXT: wait_3d

  NODE wait_2d (wait)
    TYPE: duration
    DURATION: 2 DAYS
    NEXT: check_still_inactive

  NODE check_still_inactive (condition)
    IF EXISTS event WHERE
         event.type IN ("feature_used", "login")
         AND event.time >= NOW() - 2 DAYS:
      NEXT: wait_7d
    ELSE:
      NEXT: send_support_offer

  NODE send_support_offer (send_message)
    CHANNEL: email_channel
    TEMPLATE: trial_support_offer
    NEXT: wait_7d

  NODE wait_3d (wait)
    TYPE: duration
    DURATION: 3 DAYS
    NEXT: wait_7d

  NODE wait_7d (wait)
    TYPE: duration
    DURATION: 7 DAYS
    NEXT: check_usage_stats

  NODE check_usage_stats (condition)
    IF COUNT(event WHERE 
         event.type = "feature_used"
         AND event.time >= journey.state.entry_time) >= 5:
      NEXT: send_conversion_offer_heavy_user
    ELSE:
      NEXT: send_conversion_offer_standard

  NODE send_conversion_offer_heavy_user (send_message)
    CHANNEL: email_channel
    TEMPLATE: trial_conversion_offer_premium
    NEXT: wait_3d_before_end

  NODE send_conversion_offer_standard (send_message)
    CHANNEL: email_channel
    TEMPLATE: trial_conversion_offer_basic
    NEXT: wait_3d_before_end

  NODE wait_3d_before_end (wait)
    TYPE: duration
    DURATION: 3 DAYS
    NEXT: check_trial_end_date

  NODE check_trial_end_date (condition)
    IF NOW() >= journey.state.trial_end_date - 1 DAY:
      NEXT: send_trial_ending_reminder
    ELSE:
      NEXT: wait_trial_end

  NODE wait_trial_end (wait)
    TYPE: condition
    CONDITION: NOW() >= journey.state.trial_end_date
    CHECK_INTERVAL: 1 HOUR
    NEXT: check_trial_ending_reminder_sent

  NODE check_trial_ending_reminder_sent (condition)
    IF journey.state.trial_ending_reminder_sent = true:
      NEXT: check_conversion
    ELSE:
      NEXT: send_trial_ending_reminder

  NODE send_trial_ending_reminder (send_message)
    CHANNEL: email_channel
    TEMPLATE: trial_ending_reminder
    NEXT: update_reminder_sent

  NODE update_reminder_sent (update_contact)
    SET journey.state.trial_ending_reminder_sent = true
    NEXT: check_conversion

  NODE check_conversion (condition)
    IF EXISTS event WHERE
         event.type = "subscription_created"
         AND event.time >= journey.state.entry_time:
      NEXT: send_conversion_success
    ELSE:
      NEXT: wait_1d_after_end

  NODE wait_1d_after_end (wait)
    TYPE: duration
    DURATION: 1 DAY
    NEXT: check_conversion_final

  NODE check_conversion_final (condition)
    IF EXISTS event WHERE
         event.type = "subscription_created":
      NEXT: send_conversion_success
    ELSE:
      NEXT: send_trial_expired

  NODE send_conversion_success (send_message)
    CHANNEL: email_channel
    TEMPLATE: conversion_success
    NEXT: update_converted_tag

  NODE update_converted_tag (update_contact)
    REMOVE tags = "trial_user"
    ADD tags = "paid_user"
    SET attributes.is_paid = true
    SET attributes.conversion_date = NOW()
    NEXT: exit_converted

  NODE send_trial_expired (send_message)
    CHANNEL: email_channel
    TEMPLATE: trial_expired
    NEXT: update_expired_tag

  NODE update_expired_tag (update_contact)
    REMOVE tags = "trial_user"
    ADD tags = "trial_expired"
    SET attributes.trial_expired_date = NOW()
    NEXT: wait_30d_winback

  NODE wait_30d_winback (wait)
    TYPE: duration
    DURATION: 30 DAYS
    NEXT: send_winback_offer

  NODE send_winback_offer (send_message)
    CHANNEL: email_channel
    TEMPLATE: trial_winback_offer
    NEXT: exit_expired

  NODE exit_converted (exit)
    REASON: "Trial converted to paid"

  NODE exit_expired (exit)
    REASON: "Trial expired - winback sent"
END
```

### 2.3 Templates (Auswahl)

**trial_welcome:**
```
Subject: Willkommen bei {{workspace.name}} - Deine 14-tägige Testversion beginnt!

Hallo {{contact.attributes.first_name}},

herzlich willkommen bei {{workspace.name}}! 🎉

Deine 14-tägige Testversion läuft ab jetzt. Du hast vollen Zugriff auf alle Premium-Features.

Was dich erwartet:
✅ Feature 1: [Beschreibung]
✅ Feature 2: [Beschreibung]
✅ Feature 3: [Beschreibung]

Trial endet: {{journey.state.trial_end_date | format: DD.MM.YYYY}}

Los geht's: {{workspace.website_url}}

Viele Grüße,
{{workspace.name}} Team
```

**trial_conversion_offer_premium:**
```
Subject: Exklusiv: 20% Rabatt auf Premium - nur für dich! 🎁

Hallo {{contact.attributes.first_name}},

du nutzt bereits viele Features von {{workspace.name}} - perfekt!

Als Belohnung für dein Engagement:
**20% Rabatt auf Premium** für die ersten 6 Monate!

Code: TRIAL20
Gültig bis: {{journey.state.trial_end_date | format: DD.MM.YYYY}}

Jetzt upgraden: {{workspace.upgrade_url}}

Viele Grüße,
{{workspace.name}} Team
```

---

## 3. E-COMMERCE: POST-PURCHASE ENGAGEMENT

### 3.1 Use Case
Nach Kauf: Follow-up, Review-Anfrage, Upsell

### 3.2 Journey-Definition (DSL)

```
DEFINE JOURNEY post_purchase_engagement
  TRIGGER ON event "purchase"
  REENTRY_POLICY: parallel
  
  NODE send_order_confirmation (send_message)
    CHANNEL: email_channel
    TEMPLATE: order_confirmation
    NEXT: update_customer_tag

  NODE update_customer_tag (update_contact)
    ADD tags = "customer"
    SET attributes.is_customer = true
    INCREMENT attributes.lifetime_value = last_event.properties.amount
    SET attributes.last_purchase_date = NOW()
    SET attributes.last_purchase_amount = last_event.properties.amount
    NEXT: wait_shipping

  NODE wait_shipping (wait)
    TYPE: event
    EVENT_TYPE: "order_shipped"
    TIMEOUT: 7 DAYS
    NEXT: send_shipping_notification

  NODE send_shipping_notification (send_message)
    CHANNEL: email_channel
    TEMPLATE: shipping_notification
    NEXT: wait_delivery

  NODE wait_delivery (wait)
    TYPE: event
    EVENT_TYPE: "order_delivered"
    TIMEOUT: 14 DAYS
    NEXT: wait_3d_after_delivery

  NODE wait_3d_after_delivery (wait)
    TYPE: duration
    DURATION: 3 DAYS
    NEXT: send_review_request

  NODE send_review_request (send_message)
    CHANNEL: email_channel
    TEMPLATE: review_request
    NEXT: wait_7d_for_review

  NODE wait_7d_for_review (wait)
    TYPE: duration
    DURATION: 7 DAYS
    NEXT: check_review_submitted

  NODE check_review_submitted (condition)
    IF EXISTS event WHERE
         event.type = "review_submitted"
         AND event.properties.order_id = journey.state.order_id:
      NEXT: send_review_thank_you
    ELSE:
      NEXT: send_upsell_offer

  NODE send_review_thank_you (send_message)
    CHANNEL: email_channel
    TEMPLATE: review_thank_you
    NEXT: update_reviewer_tag

  NODE update_reviewer_tag (update_contact)
    ADD tags = "reviewer"
    NEXT: send_upsell_offer

  NODE send_upsell_offer (send_message)
    CHANNEL: email_channel
    TEMPLATE: upsell_offer
    NEXT: wait_14d_for_repurchase

  NODE wait_14d_for_repurchase (wait)
    TYPE: duration
    DURATION: 14 DAYS
    NEXT: check_repurchase

  NODE check_repurchase (condition)
    IF EXISTS event WHERE
         event.type = "purchase"
         AND event.time >= journey.state.last_purchase_date:
      NEXT: exit_repurchased
    ELSE:
      NEXT: send_loyalty_program_offer

  NODE send_loyalty_program_offer (send_message)
    CHANNEL: email_channel
    TEMPLATE: loyalty_program_offer
    NEXT: exit_completed

  NODE exit_repurchased (exit)
    REASON: "Customer repurchased"

  NODE exit_completed (exit)
    REASON: "Post-purchase journey completed"
END
```

---

## 4. MULTI-CHANNEL: CHURN PREVENTION

### 4.1 Use Case
Erkenne Churn-Risiko und reagiere proaktiv über mehrere Kanäle

### 4.2 Journey-Definition (DSL)

```
DEFINE JOURNEY churn_prevention
  TRIGGER ON segment_enter "at_risk_customers"
  REENTRY_POLICY: skip
  
  NODE check_risk_level (branch)
    BRANCH IF contact.attributes.churn_score >= 80:
      NEXT: send_high_risk_intervention
    BRANCH IF contact.attributes.churn_score >= 60:
      NEXT: send_medium_risk_intervention
    ELSE:
      NEXT: send_low_risk_intervention

  NODE send_high_risk_intervention (send_message)
    CHANNEL: sms_channel  // SMS für höchste Priorität
    TEMPLATE: churn_prevention_high_risk_sms
    NEXT: wait_2h_sms

  NODE wait_2h_sms (wait)
    TYPE: duration
    DURATION: 2 HOURS
    NEXT: send_high_risk_email

  NODE send_high_risk_email (send_message)
    CHANNEL: email_channel
    TEMPLATE: churn_prevention_high_risk_email
    NEXT: wait_1d_high

  NODE send_medium_risk_intervention (send_message)
    CHANNEL: email_channel
    TEMPLATE: churn_prevention_medium_risk
    NEXT: wait_1d_medium

  NODE send_low_risk_intervention (send_message)
    CHANNEL: email_channel
    TEMPLATE: churn_prevention_low_risk
    NEXT: wait_3d_low

  NODE wait_1d_high (wait)
    TYPE: duration
    DURATION: 1 DAY
    NEXT: check_engagement_high

  NODE wait_1d_medium (wait)
    TYPE: duration
    DURATION: 1 DAY
    NEXT: check_engagement_medium

  NODE wait_3d_low (wait)
    TYPE: duration
    DURATION: 3 DAYS
    NEXT: check_engagement_low

  NODE check_engagement_high (condition)
    IF EXISTS event WHERE
         event.type IN ("login", "feature_used", "purchase")
         AND event.time >= NOW() - 1 DAY:
      NEXT: update_risk_reduced
    ELSE:
      NEXT: send_personal_offer_high

  NODE check_engagement_medium (condition)
    IF EXISTS event WHERE
         event.type IN ("login", "feature_used")
         AND event.time >= NOW() - 1 DAY:
      NEXT: update_risk_reduced
    ELSE:
      NEXT: send_personal_offer_medium

  NODE check_engagement_low (condition)
    IF EXISTS event WHERE
         event.type = "login"
         AND event.time >= NOW() - 3 DAYS:
      NEXT: update_risk_reduced
    ELSE:
      NEXT: send_personal_offer_low

  NODE send_personal_offer_high (send_message)
    CHANNEL: email_channel
    TEMPLATE: churn_personal_offer_high
    NEXT: update_risk_reduced

  NODE send_personal_offer_medium (send_message)
    CHANNEL: email_channel
    TEMPLATE: churn_personal_offer_medium
    NEXT: update_risk_reduced

  NODE send_personal_offer_low (send_message)
    CHANNEL: email_channel
    TEMPLATE: churn_personal_offer_low
    NEXT: update_risk_reduced

  NODE update_risk_reduced (update_contact)
    DECREMENT attributes.churn_score = 10
    NEXT: exit_risk_reduced

  NODE exit_risk_reduced (exit)
    REASON: "Churn risk reduced"
END

DEFINE SEGMENT at_risk_customers
  WHERE
    contact.attributes.is_customer = true
    AND contact.attributes.churn_score >= 50
    AND NOT EXISTS event WHERE
      event.type = "login"
      AND event.time >= NOW() - 7 DAYS
  DYNAMIC: true
END
```

---

## 5. EVENT-DRIVEN: REAL-TIME PERSONALIZATION

### 5.1 Use Case
Echtzeit-Reaktion auf Kundenverhalten mit personalisierten Aktionen

### 5.2 Journey-Definition (DSL)

```
DEFINE JOURNEY real_time_personalization
  TRIGGER ON event "page_view"
  REENTRY_POLICY: parallel
  
  NODE check_page_type (branch)
    BRANCH IF last_event.properties.page = "product_page":
      NEXT: personalize_product_page
    BRANCH IF last_event.properties.page = "pricing_page":
      NEXT: personalize_pricing_page
    BRANCH IF last_event.properties.page = "checkout_page":
      NEXT: personalize_checkout_page
    ELSE:
      NEXT: exit_no_personalization

  NODE personalize_product_page (update_contact)
    SET attributes.last_product_viewed = last_event.properties.product_id
    SET attributes.last_product_category = last_event.properties.category
    SET journey.state.viewed_products = 
      append(journey.state.viewed_products ?? [], last_event.properties.product_id)
    NEXT: check_view_count

  NODE check_view_count (condition)
    IF COUNT(event WHERE
         event.type = "page_view"
         AND event.properties.page = "product_page"
         AND event.time >= NOW() - 1 HOUR) >= 3:
      NEXT: send_product_interest_offer
    ELSE:
      NEXT: exit_standard

  NODE send_product_interest_offer (send_message)
    CHANNEL: email_channel
    TEMPLATE: product_interest_offer
    NEXT: exit_standard

  NODE personalize_pricing_page (condition)
    IF contact.attributes.country = "DE":
      NEXT: show_euro_pricing
    ELSE:
      NEXT: show_usd_pricing

  NODE show_euro_pricing (update_contact)
    SET journey.state.currency = "EUR"
    NEXT: check_trial_eligible

  NODE show_usd_pricing (update_contact)
    SET journey.state.currency = "USD"
    NEXT: check_trial_eligible

  NODE check_trial_eligible (condition)
    IF contact.attributes.trial_used = false:
      NEXT: send_trial_offer
    ELSE:
      NEXT: send_discount_offer

  NODE send_trial_offer (send_message)
    CHANNEL: email_channel
    TEMPLATE: trial_offer
    NEXT: exit_standard

  NODE send_discount_offer (send_message)
    CHANNEL: email_channel
    TEMPLATE: discount_offer
    NEXT: exit_standard

  NODE personalize_checkout_page (condition)
    IF EXISTS event WHERE
         event.type = "cart_abandoned"
         AND event.time >= NOW() - 24 HOURS:
      NEXT: send_checkout_reminder
    ELSE:
      NEXT: exit_standard

  NODE send_checkout_reminder (send_message)
    CHANNEL: sms_channel  // SMS für höchste Priorität
    TEMPLATE: checkout_reminder_sms
    NEXT: exit_standard

  NODE exit_standard (exit)
    REASON: "Personalization applied"

  NODE exit_no_personalization (exit)
    REASON: "No personalization needed"
END
```

---

## 6. SEGMENT-BASIERT: BIRTHDAY CAMPAIGN

### 6.1 Use Case
Automatische Geburtstags-Glückwünsche mit Gutschein

### 6.2 Journey-Definition (DSL)

```
DEFINE JOURNEY birthday_campaign
  TRIGGER ON segment_enter "birthday_this_month"
  REENTRY_POLICY: skip
  
  NODE check_birthday_date (condition)
    IF contact.attributes.birthday = TODAY():
      NEXT: send_birthday_email
    ELSE:
      NEXT: wait_until_birthday

  NODE wait_until_birthday (wait)
    TYPE: condition
    CONDITION: contact.attributes.birthday = TODAY()
    CHECK_INTERVAL: 1 HOUR
    NEXT: send_birthday_email

  NODE send_birthday_email (send_message)
    CHANNEL: email_channel
    TEMPLATE: birthday_greeting
    NEXT: check_customer_tier

  NODE check_customer_tier (branch)
    BRANCH IF contact.attributes.lifetime_value >= 1000:
      NEXT: send_vip_birthday_gift
    BRANCH IF contact.attributes.lifetime_value >= 500:
      NEXT: send_premium_birthday_gift
    ELSE:
      NEXT: send_standard_birthday_gift

  NODE send_vip_birthday_gift (update_contact)
    SET journey.state.birthday_voucher_code = "BDAY" + contact.id.substring(0,8)
    SET journey.state.birthday_voucher_amount = 50
    SET journey.state.birthday_voucher_expiry = NOW() + 30 DAYS
    NEXT: send_vip_voucher_email

  NODE send_premium_birthday_gift (update_contact)
    SET journey.state.birthday_voucher_code = "BDAY" + contact.id.substring(0,8)
    SET journey.state.birthday_voucher_amount = 25
    SET journey.state.birthday_voucher_expiry = NOW() + 30 DAYS
    NEXT: send_premium_voucher_email

  NODE send_standard_birthday_gift (update_contact)
    SET journey.state.birthday_voucher_code = "BDAY" + contact.id.substring(0,8)
    SET journey.state.birthday_voucher_amount = 10
    SET journey.state.birthday_voucher_expiry = NOW() + 30 DAYS
    NEXT: send_standard_voucher_email

  NODE send_vip_voucher_email (send_message)
    CHANNEL: email_channel
    TEMPLATE: birthday_voucher_vip
    NEXT: exit_completed

  NODE send_premium_voucher_email (send_message)
    CHANNEL: email_channel
    TEMPLATE: birthday_voucher_premium
    NEXT: exit_completed

  NODE send_standard_voucher_email (send_message)
    CHANNEL: email_channel
    TEMPLATE: birthday_voucher_standard
    NEXT: exit_completed

  NODE exit_completed (exit)
    REASON: "Birthday campaign completed"
END

DEFINE SEGMENT birthday_this_month
  WHERE
    contact.attributes.birthday IS NOT NULL
    AND MONTH(contact.attributes.birthday) = MONTH(NOW())
    AND YEAR(contact.attributes.birthday) <= YEAR(NOW())
  DYNAMIC: true
END
```

---

## 7. MULTI-STEP: PRODUCT LAUNCH CAMPAIGN

### 7.1 Use Case
Mehrstufige Kampagne für Produktlaunch mit Teasern, Launch, Follow-up

### 7.2 Journey-Definition (DSL)

```
DEFINE JOURNEY product_launch_campaign
  TRIGGER ON segment_enter "interested_in_category_X"
  REENTRY_POLICY: skip
  
  // Phase 1: Teaser (1 Woche vor Launch)
  NODE send_teaser_email (send_message)
    CHANNEL: email_channel
    TEMPLATE: product_launch_teaser
    NEXT: update_teaser_sent

  NODE update_teaser_sent (update_contact)
    SET journey.state.teaser_sent = true
    SET journey.state.teaser_sent_date = NOW()
    NEXT: wait_3d_teaser

  NODE wait_3d_teaser (wait)
    TYPE: duration
    DURATION: 3 DAYS
    NEXT: check_launch_date_approaching

  NODE check_launch_date_approaching (condition)
    IF launch_date - NOW() <= 3 DAYS:
      NEXT: send_sneak_peek
    ELSE:
      NEXT: wait_until_launch_minus_3d

  NODE wait_until_launch_minus_3d (wait)
    TYPE: condition
    CONDITION: launch_date - NOW() <= 3 DAYS
    CHECK_INTERVAL: 1 DAY
    NEXT: send_sneak_peek

  NODE send_sneak_peek (send_message)
    CHANNEL: email_channel
    TEMPLATE: product_launch_sneak_peek
    NEXT: update_sneak_peek_sent

  NODE update_sneak_peek_sent (update_contact)
    SET journey.state.sneak_peek_sent = true
    NEXT: wait_until_launch

  NODE wait_until_launch (wait)
    TYPE: condition
    CONDITION: launch_date <= NOW()
    CHECK_INTERVAL: 1 HOUR
    NEXT: send_launch_announcement

  // Phase 2: Launch
  NODE send_launch_announcement (send_message)
    CHANNEL: email_channel
    TEMPLATE: product_launch_announcement
    NEXT: send_sms_launch  // Multi-Channel

  NODE send_sms_launch (send_message)
    CHANNEL: sms_channel
    TEMPLATE: product_launch_sms
    NEXT: wait_24h_after_launch

  NODE wait_24h_after_launch (wait)
    TYPE: duration
    DURATION: 24 HOURS
    NEXT: check_early_adopter

  NODE check_early_adopter (condition)
    IF EXISTS event WHERE
         event.type = "purchase"
         AND event.properties.product_id = launch_product_id:
      NEXT: send_early_adopter_thank_you
    ELSE:
      NEXT: send_launch_reminder

  NODE send_early_adopter_thank_you (send_message)
    CHANNEL: email_channel
    TEMPLATE: early_adopter_thank_you
    NEXT: update_early_adopter_tag

  NODE update_early_adopter_tag (update_contact)
    ADD tags = "early_adopter"
    ADD tags = "product_X_customer"
    NEXT: wait_7d_follow_up

  NODE send_launch_reminder (send_message)
    CHANNEL: email_channel
    TEMPLATE: product_launch_reminder
    NEXT: wait_7d_follow_up

  NODE wait_7d_follow_up (wait)
    TYPE: duration
    DURATION: 7 DAYS
    NEXT: send_follow_up_content

  // Phase 3: Follow-up
  NODE send_follow_up_content (send_message)
    CHANNEL: email_channel
    TEMPLATE: product_launch_follow_up
    NEXT: check_purchase_after_follow_up

  NODE check_purchase_after_follow_up (wait)
    TYPE: event
    EVENT_TYPE: "purchase"
    EVENT_CONDITION: event.properties.product_id = launch_product_id
    TIMEOUT: 14 DAYS
    NEXT: send_post_purchase_content

  NODE send_post_purchase_content (send_message)
    CHANNEL: email_channel
    TEMPLATE: product_post_purchase_content
    NEXT: exit_completed

  NODE exit_completed (exit)
    REASON: "Product launch campaign completed"
END
```

---

## 8. BEST PRACTICES AUS DEN BEISPIELEN

### 8.1 Timing-Strategien

**Abgestufte Erinnerungen:**
- 1. Erinnerung: 2 Stunden
- 2. Erinnerung: 24 Stunden
- 3. Erinnerung: 48-72 Stunden

**Geburtstags-Kampagnen:**
- Genau am Geburtstag (Condition-Wait)
- Check-Interval: 1 Stunde

### 8.2 Multi-Channel-Strategien

**Priorisierung:**
- Hoch: SMS (sofortige Aufmerksamkeit)
- Standard: Email (detailliert)
- Follow-up: Push (optional)

**Kombinationen:**
- SMS + Email für kritische Aktionen
- Nur Email für Informationszwecke

### 8.3 Personalisierung

**Dynamische Inhalte:**
- Basierend auf Lifetime Value
- Basierend auf Verhalten (Event-History)
- Basierend auf Segment-Zugehörigkeit

**Rabatt-Strategien:**
- Abgestufte Rabatte (10% → 15%)
- Personalisierte Codes (kontakt-spezifisch)
- Zeitliche Begrenzung (Urgency)

### 8.4 Segment-Integration

**Segment-Trigger:**
- `segment_enter` - Eintritt in Segment
- `segment_exit` - Austritt aus Segment

**Dynamische Segmente:**
- Automatische Aktualisierung
- Realtime-Trigger möglich

---

## ENDE DER BEISPIELE

**Diese Beispiele enthalten:**
- ✅ 8 produktionsreife Journey-Patterns
- ✅ Multi-Channel-Strategien
- ✅ Timing-Optimierungen
- ✅ Personalisierungs-Techniken
- ✅ Segment-Integration

**Verwendung:**
- Als Vorlagen für eigene Journeys
- Als Lernbeispiele
- Als Best-Practice-Referenz

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-01-27
