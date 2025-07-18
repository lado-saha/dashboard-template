# Spécification des messages Kafka ReadyCash

**Version :** 1.0.0
**Date :** 17 juillet 2025
**Statut :** DEVELOPEMENT

## 1. Introduction

Cette spécification définit le format unifié des messages pour la plateforme ReadyCash orientée événements. Elle remplit trois objectifs essentiels :

1. **Synchronisation des vues matérialisées** : Les services conservent des copies locales des données nécessaires provenant d'autres services
2. **Communication interne entre services** : Commandes et événements échangés entre microservices
3. **Intégration externe** : Applications tierces consommant les événements ReadyCash

Tous les messages suivent une structure cohérente quelle que soit leur finalité, assurant une expérience d’intégration unifiée.

## 2. Contexte d’architecture

ReadyCash applique des principes stricts d’architecture orientée événements :

* **Pas d’appels directs entre services** : Communication uniquement via Kafka
* **Propriété des données** : Chaque service est propriétaire exclusif de sa base de données
* **Vues matérialisées** : Les services maintiennent des copies locales en lecture seule des données externes
* **Tout est asynchrone** : Toute communication est non bloquante

## 3. Structure du message

Chaque message Kafka est composé de quatre éléments :

| Élément      | Rôle                                        | Exemple          |
| ------------ | ------------------------------------------- | ---------------- |
| **Topic**    | Routage basé sur le domaine                 | `product-events` |
| **Clé**      | Identifiant de l’entité pour ordonnancement | `"pdt-abc-123"`  |
| **En-têtes** | Métadonnées techniques                      | Voir section 4.1 |
| **Valeur**   | Données complètes de l’événement            | Voir section 4.2 |

## 4. Spécification détaillée

### 4.1. En-têtes (métadonnées techniques)

Les en-têtes permettent un routage et un filtrage efficaces sans désérialiser le contenu du message.

| Clé de l’en-tête | Obligatoire | Description                                          | Exemple                                      |
| ---------------- | ----------- | ---------------------------------------------------- | -------------------------------------------- |
| `event_id`       | Oui         | Identifiant unique de l’événement (UUID v4)          | `"2a1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"` |
| `schema_type`     | Oui         | Type spécifique d’événement : `<ressource>-<action>` | `"product-updated"`                          |
| `source_service` | Oui         | Identifiant du service émetteur                      | `"product-service"`                          |
| `correlation_id` | Oui         | ID de corrélation pour traçabilité                   | `"corr_abc123-xyz789"`                       |
| `event_version`  | Oui         | Version du schéma de l’événement                     | `"1.0"`                                      |
| `message_type`   | Oui         | `"event"` ou `"command"`                             | `"event"`                                    |
| `category`       | Non         | Catégorie métier pour filtrage                       | `"loan"`, `"savings"`                                     |

### 4.2. Valeur (enveloppe JSON de l’événement)

Données complètes de l’événement au format JSON.

### 4.3. Description des champs

| Champ            | Rôle                               | Détails                                                     |
| ---------------- | ---------------------------------- | ----------------------------------------------------------- |
| `event_id`       | Idempotence                        | UUID v4 pour détecter les doublons                          |
| `schema_type`     | Filtrage                           | Format : `<ressource>-<action>` (exemple : `loan-approved`) |
| `event_version`  | Évolution du schéma                | Version sémantique (1.0, 1.1, 2.0)                          |
| `source_service` | Traçabilité                        | Service ayant publié cet événement                          |
| `timestamp`      | Ordonnancement                     | Date et heure de l’événement métier (UTC, ISO 8601)         |
| `correlation_id` | Tracing                            | Lie les événements liés dans un processus métier            |
| `entity_id`      | Partitionnement                    | Entité concernée (correspond à la clé du message)           |
| `operation`      | Synchronisation vues matérialisées | Comment appliquer la modification                           |
| `message_type`   | Routage                            | Différencie événements et commandes (Les commandes sont actuellement)                         |
| `category`       | Filtrage métier                    | Catégorie principale : `loan`, `savings`, etc.   |
| `payload`        | Données métier                     | État complet et actuel de l’entité                          |

### 4.4. Types d’opérations

Essentiel pour la synchronisation des vues matérialisées :

| Opération | Description                           | Action sur la vue matérialisée                 |
| --------- | ------------------------------------- | ---------------------------------------------- |
| `CREATE`  | Création d’une nouvelle entité        | `INSERT INTO mv_table`                         |
| `UPDATE`  | Modification d’une entité             | `UPDATE mv_table SET ... WHERE id = entity_id` |
| `DELETE`  | Suppression d’une entité              | `DELETE FROM mv_table WHERE id = entity_id`    |
| `VOID`    | Événement métier sans synchronisation | Pas de modification de vue matérialisée. Peut aussi être utilisé lorsque l'initiateur n'est pas certain de l'action à entreprendre.         |

**Note** : Les états métier comme `SUSPENDED`, `COMPLETED` sont représentés dans le type d’événement (ex : `loan-suspended`) et non comme opérations distinctes.

### 4.5. Types de messages

| Type      | Description                                    | Exemple                               |
| --------- | ---------------------------------------------- | ------------------------------------- |
| `event`   | Quelque chose qui s’est produit (passé)        | `loan-approved`, `payment-received`   |
| `command` | Quelque chose qui doit se produire (impératif) | `transfer-funds`, `send-notification` |

## 5. Conception des topics

### 5.1. Convention de nommage

Les topics sont nommés selon le domaine : `<domain>-events`

**Topics principaux :**

* `product-events` - Tous les événements liés aux produits
* `loan-events` - Tous les événements liés aux prêts
* `account-events` - Tous les événements comptables
* `user-events` - Tous les événements utilisateurs
* `notification-events` - Tous les événements de notification
* `savings-events` - Tous les événements de comptes épargne
* `payment-events` - Tous les événements de paiement

### 5.2. Groupes de consommateurs

Chaque instance de service appartient à un groupe nommé d’après le service :

* `product-service-group`
* `loan-service-group`
* `notification-service-group`
* `analytics-service-group`

Cela garantit l’équilibrage de charge tout en maintenant l’ordre par partition.

---

**Contrôle du document :**

* **Auteur :** Plateforme ReadyCash
* **Diffusion :** Toutes les équipes de développement, partenaires externes
