Application to help manage topic partitions of some kafka brokers

# Environment variables to run:
### Required variables
| Var name                         | Description                                                                                       | Default value | Available options |
|----------------------------------|---------------------------------------------------------------------------------------------------|---------------|-------------------|
| KAFKA_BOOTSTRAP_SERVERS          | Kafka broker(s) to connect                                                                        |               | [IP:PORT,...]     |


### Optional variables
| Var name                               | Description                                                                                       | Default value                 | Available options               |
|----------------------------------------|---------------------------------------------------------------------------------------------------|-------------------------------|---------------------------------|
| CONFIG_PROPERTIES_FILE_PATH            | Additional config parameters to connect to the brokers (SSL?) - The path to find the config file. |                               | Any linux path                  |
| LOG_LEVEL                              | Kafka broker(s) to connect                                                                        | INFO                          | TRACE, DEBUG, INFO, WARN, ERROR |
